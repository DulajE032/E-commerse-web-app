from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str

    model_config = ConfigDict(extra="forbid")


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserSignup(UserCreate):
    turnstile_token: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    turnstile_token: str | None = None

    model_config = ConfigDict(extra="forbid")


class UserRead(UserBase):
    id: int
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str

    model_config = ConfigDict(extra="forbid")


class LogoutRequest(BaseModel):
    refresh_token: str | None = None

    model_config = ConfigDict(extra="forbid")


class GoogleAuthRequest(BaseModel):
    """The frontend sends us the ID token Google gave it."""
    id_token: str

    model_config = ConfigDict(extra="forbid")
