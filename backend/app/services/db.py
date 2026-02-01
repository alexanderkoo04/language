from datetime import datetime, timedelta, timezone
from app.clients import supabase_client

def create_translation_record(user_id: str | None, original_url: str, target_lang: str, storage_path: str):
    # Logic: Guest = 24 hours, User = 30 days
    now = datetime.now(timezone.utc)
    if user_id:
        duration = timedelta(days=30)
    else:
        duration = timedelta(hours=24)
        
    expires_at = now + duration

    data = {
        "user_id": user_id,
        "original_url": original_url,
        "target_language": target_lang,
        "storage_path": storage_path,
        "expires_at": expires_at.isoformat()
    }
    
    response = supabase_client.table("translations").insert(data).execute()
    return response.data[0]

def get_translation(translation_id: str):
    """Fetches metadata and checks expiration."""
    response = supabase_client.table("translations").select("*").eq("id", translation_id).execute()
    
    if not response.data:
        return None
        
    record = response.data[0]
    
    # Check Expiration
    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        return None # Effectively 404 if expired
        
    return record

def get_user_translations(user_id: str):
    response = supabase_client.table("translations").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data