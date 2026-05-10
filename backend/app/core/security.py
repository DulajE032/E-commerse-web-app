import hashlib
import hmac


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    computed_hash = hash_password(password)
    return hmac.compare_digest(computed_hash, password_hash)
