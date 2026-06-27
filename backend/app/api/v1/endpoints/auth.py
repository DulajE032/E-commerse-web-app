# ✅ Added Request to the import list
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.security import create_access_token, get_current_user, verify_password
from app.services import crud_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserRead, UserRole, UserSignup
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