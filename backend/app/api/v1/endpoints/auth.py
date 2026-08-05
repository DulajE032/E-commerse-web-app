# ✅ Added Request to the import list
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import create_access_token, get_current_user, verify_password
from app.services import crud_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import GoogleAuthRequest, TokenResponse, UserCreate, UserLogin, UserRead, UserRole, UserSignup
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()

# We still create the limiter here so we can use it on the routes below
limiter = Limiter(key_func=get_remote_address)
# ❌ Removed: router.state.limiter = limiter (This goes in main.py now)

def normalize_email(email: str) -> str:
    return email.strip().lower()

# (Signup endpoint remains exactly the same, no limiter needed here unless you want one!)
@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserSignup, db: Session = Depends(get_db)):
    email = normalize_email(user_in.email)
    if crud_user.get_user_by_email(db, email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    create_payload = UserCreate(
        email=email,
        full_name=user_in.full_name,
        password=user_in.password,
    )
    return crud_user.create_user(db=db, user_in=create_payload, role=UserRole.USER.value)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
# ✅ Added request: Request
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    email = normalize_email(credentials.email)
    user = crud_user.get_user_by_email(db, email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.role == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    token = create_access_token(subject=str(user.id), role=user.role)
    return TokenResponse(access_token=token)


@router.post("/admin-login", response_model=TokenResponse)
@limiter.limit("2/minute")
# ✅ Added request: Request
def admin_login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    email = normalize_email(credentials.email)
    user = crud_user.get_user_by_email(db, email)
    if (
        not user
        or user.role != UserRole.ADMIN.value
        or not verify_password(credentials.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=str(user.id), role=user.role)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Receives a Google ID Token from the frontend.
    Verifies it, then finds or creates the user in our DB.
    Returns our own JWT access token.
    """
    try:
        # 1. Verify the token with Google's servers
        google_info = id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        # Token is invalid or expired
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )

    # 2. Extract user info from the verified token
    google_id = google_info["sub"]       # Google's unique user ID
    email = google_info["email"]
    full_name = google_info.get("name", "Google User")

    # 3. Find or Create the user in our database
    user = crud_user.get_user_by_email(db, email)

    if user:
        # User exists — update their google_id if not set
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
    else:
        # New user — create them (no password needed)
        user = User(
            email=email,
            full_name=full_name,
            password_hash=None,  # Google users have no password
            google_id=google_id,
            role=UserRole.USER.value,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. Issue our own JWT — same as your existing login flow
    token = create_access_token(subject=str(user.id), role=user.role)
    return TokenResponse(access_token=token)
