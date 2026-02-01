from fastapi import Header, HTTPException
from app.clients import supabase_client

def get_current_user(authorization: str | None = Header(default=None)) -> str | None:
    """
    Validates Supabase JWT. Returns user_id if valid, None if guest.
    """
    if not authorization:
        return None

    try:
        # Expects "Bearer <token>"
        token = authorization.split(" ")[1]
        user = supabase_client.auth.get_user(token)
        return user.user.id
    except Exception:
        # If token is invalid, treat as guest or raise error depending on strictness
        # Here we treat as guest to allow fallback
        return None

def require_auth(authorization: str | None = Header(default=None)):
    user_id = get_current_user(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id