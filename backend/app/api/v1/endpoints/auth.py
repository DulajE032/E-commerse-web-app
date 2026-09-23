from fastapi import APIRouter, Depends, HTTPException, Request, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    revoke_refresh_token,
    verify_password,
    verify_refresh_token,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    GoogleAuthRequest,
    LogoutRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserRead,
    UserRole,
    UserSignup,
)
from app.services import crud_user
from app.services.turnstile import verify_turnstile_token

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def normalize_email(email: str) -> str:
    return email.strip().lower()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: Request, user_in: UserSignup, db: Session = Depends(get_db)):
    # Verify Cloudflare Turnstile token
    if not await verify_turnstile_token(user_in.turnstile_token or "", request.client.host if request.client else None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bot verification failed. Please try again.")

    email = normalize_email(user_in.email)
    if crud_user.get_user_by_email(db, email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    create_payload = UserCreate(
        email=email,
        full_name=user_in.full_name,
        password=user_in.password,
    )
    user = crud_user.create_user(db=db, user_in=create_payload, role=UserRole.USER.value)
    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(db=db, user_id=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    # Verify Cloudflare Turnstile token
    if not await verify_turnstile_token(credentials.turnstile_token or "", request.client.host if request.client else None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bot verification failed. Please try again.")

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

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(db=db, user_id=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/admin-login", response_model=TokenResponse)
@limiter.limit("2/minute")
async def admin_login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    # Verify Cloudflare Turnstile token
    if not await verify_turnstile_token(credentials.turnstile_token or "", request.client.host if request.client else None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bot verification failed. Please try again.")

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

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(db=db, user_id=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token_endpoint(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    db_token = verify_refresh_token(db=db, token=payload.refresh_token)
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found",
        )

    # Token rotation: revoke previous refresh token, issue a fresh pair
    revoke_refresh_token(db=db, token=payload.refresh_token)
    new_access_token = create_access_token(subject=str(user.id), role=user.role)
    new_refresh_token = create_refresh_token(db=db, user_id=user.id)
    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)


@router.post("/logout")
def logout_endpoint(payload: LogoutRequest, db: Session = Depends(get_db)):
    if payload.refresh_token:
        revoke_refresh_token(db=db, token=payload.refresh_token)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Receives a Google ID Token from the frontend.
    Verifies it, then finds or creates the user in our DB.
    Returns access token and refresh token.
    """
    try:
        client_id = settings.GOOGLE_CLIENT_ID.strip() if settings.GOOGLE_CLIENT_ID else None
        google_info = id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            client_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not connect to Google authentication service: {str(e)}",
        )

    google_id = google_info.get("sub")
    email = google_info.get("email")
    full_name = google_info.get("name", "Google User")

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not provided by Google")

    email = normalize_email(email)
    user = crud_user.get_user_by_email(db, email)

    if user:
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
    else:
        import secrets
        from app.core.security import hash_password
        random_password = secrets.token_urlsafe(32)
        user = User(
            email=email,
            full_name=full_name,
            password_hash=hash_password(random_password),
            google_id=google_id,
            role=UserRole.USER.value,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(db=db, user_id=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
