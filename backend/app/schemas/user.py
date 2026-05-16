from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: str
    full_name: str


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserSignup(UserCreate):
    pass


class UserLogin(BaseModel):
    email: str
    password: str


class UserRead(UserBase):
    id: int
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
