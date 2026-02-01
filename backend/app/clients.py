# app/clients.py
import os
from supabase import create_client, Client

# Load environment variables once
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    raise ValueError("Supabase credentials not found in environment variables")

# Initialize the client ONCE
# This instance will be shared across the entire application
supabase_client: Client = create_client(url, key)