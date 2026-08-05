import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Settings:
    APP_NAME = os.getenv("APP_NAME", "AI powered E-commerce web app")
    API_V1_PREFIX = os.getenv("API_V1_PREFIX", "/api/v1")
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    SECRET_KEY = os.getenv("SECRET_KEY", "replace-this-secret-in-env")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            os.getenv("FRONTEND_ORIGIN", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173")
        ).split(",")
        if origin.strip()
    ]

    # Email Settings
    SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
    SMTP_USER = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", None)
    SMTP_TLS = os.getenv("SMTP_TLS", "False").lower() in ("true", "1", "yes")
    SMTP_SSL = os.getenv("SMTP_SSL", "False").lower() in ("true", "1", "yes")
    EMAILS_FROM_EMAIL = os.getenv("EMAILS_FROM_EMAIL", "noreply@example.com")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")

    # GitHub Image Storage Settings
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
    GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER", "")
    GITHUB_REPO_NAME = os.getenv("GITHUB_REPO_NAME", "")

    # Google AI Credentials
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")



settings = Settings()
