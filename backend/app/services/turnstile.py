"""
Cloudflare Turnstile verification service.

Verifies the Turnstile token received from the frontend by calling
Cloudflare's siteverify API. This is completely FREE to use.
"""

import httpx

from app.core.config import settings

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile_token(token: str, remote_ip: str | None = None) -> bool:
    """
    Verify a Cloudflare Turnstile token.

    Args:
        token: The turnstile response token from the frontend widget.
        remote_ip: Optional client IP address for additional validation.

    Returns:
        True if the token is valid, False otherwise.
    """
    # Bypass verification when Turnstile is disabled (e.g. during development)
    if not settings.TURNSTILE_ENABLED:
        return True

    if not token:
        return False

    if not settings.TURNSTILE_SECRET_KEY:
        # If no secret key is configured but Turnstile is enabled, reject
        return False

    payload = {
        "secret": settings.TURNSTILE_SECRET_KEY,
        "response": token,
    }

    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(TURNSTILE_VERIFY_URL, data=payload)
            result = resp.json()
            return result.get("success", False)
    except Exception:
        # If Cloudflare is unreachable, fail open to avoid blocking users
        # In production, you may want to fail closed instead
        return False
