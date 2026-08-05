import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.security import hash_password

def create_admin():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not found in environment or .env file.")
        return

    print(f"Connecting to database...")
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        email = input("Enter admin email: ").strip().lower()
        if not email:
            print("❌ Email cannot be empty.")
            return

        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            confirm = input(f"User '{email}' already exists with role '{existing_user.role}'. Promote to admin? (y/n): ").strip().lower()
            if confirm == 'y':
                existing_user.role = "admin"
                db.commit()
                print(f"✅ User '{email}' promoted to admin successfully.")
            else:
                print("Operation cancelled.")
            return

        full_name = input("Enter admin full name: ").strip()
        password = input("Enter admin password: ").strip()
        if len(password) < 6:
            print("❌ Password must be at least 6 characters.")
            return

        # Create new admin user
        admin_user = User(
            email=email,
            full_name=full_name,
            password_hash=hash_password(password),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print(f"✅ Admin user '{email}' created successfully.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
