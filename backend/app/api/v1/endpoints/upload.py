import base64
import httpx
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.core.config import settings

# In config.py, we would read GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME from env

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
):
    # 1. Prepare file name and path
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{file_extension}"
    github_path = f"uploads/{unique_filename}"

    # 2. Read file content and encode to Base64 (GitHub API requires base64)
    content = await file.read()
    encoded_content = base64.b64encode(content).decode("utf-8")

    # 3. Call GitHub API to create/upload file
    url = f"https://api.github.com/repos/{settings.GITHUB_REPO_OWNER}/{settings.GITHUB_REPO_NAME}/contents/{github_path}"
    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    data = {
        "message": f"Upload product image: {unique_filename}",
        "content": encoded_content,
        "branch": "main" # or master
    }

    async with httpx.AsyncClient() as client:
        response = await client.put(url, headers=headers, json=data)
        
        if response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"GitHub upload failed: {response.text}"
            )

    # 4. Return the public raw CDN URL of the image!
    cdn_url = f"https://raw.githubusercontent.com/{settings.GITHUB_REPO_OWNER}/{settings.GITHUB_REPO_NAME}/main/{github_path}"
    return {"url": cdn_url}
