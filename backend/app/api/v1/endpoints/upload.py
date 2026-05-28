import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.security import require_role
from app.models.user import User

router = APIRouter()

# Setup local storage directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    _: User = Depends(require_role("admin")),
):
    """
    Upload a product image or video locally.
    Returns the URL path to access the media.
    """
    allowed_types = ["image/", "video/"]
    if not any(file.content_type.startswith(t) for t in allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided is not an image or video."
        )

    # Generate unique filename to prevent overwrites
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )

    # In a real app, this would be your server domain or Cloudinary URL
    # For now, we return a local path that we will serve via StaticFiles
    return {"url": f"/uploads/{unique_filename}"}
