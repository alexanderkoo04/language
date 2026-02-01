import uuid
from app.clients import supabase_client

BUCKET_NAME = "pages"

def upload_html(html_content: str) -> str:
    """Uploads HTML and returns the internal storage path (not the public URL)."""
    filename = f"{BUCKET_NAME}/{uuid.uuid4()}.html"
    file_bytes = html_content.encode('utf-8')
    
    supabase_client.storage.from_(BUCKET_NAME).upload(
        path=filename,
        file=file_bytes,
        file_options={"content-type": "text/html"}
    )
    return filename

def download_html(path: str) -> str:
    """Downloads HTML content from storage."""
    response = supabase_client.storage.from_(BUCKET_NAME).download(path)
    return response.decode('utf-8')

def delete_file(path: str):
    supabase_client.storage.from_(BUCKET_NAME).remove([path])