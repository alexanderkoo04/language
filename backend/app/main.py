import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup

from app.schemas import TranslationRequest, TranslationResponse, DashboardItem
from app.services import scraper, translator, rebuilder, storage, db
from app.dependencies import get_current_user, require_auth

app = FastAPI(title="Translator Backend")

# Enable CORS so your frontend can talk to this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://language-vercel.vercel.app/", "https://shittypagetranslater.com/"], # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/translate", response_model=TranslationResponse)
def generate_translation(
    request: TranslationRequest, 
    user_id: str | None = Depends(get_current_user) # Optional Auth
):
    try:
        # 1. Scrape & Process
        raw_html = scraper.fetch_html(str(request.url))
        soup = BeautifulSoup(raw_html, "html.parser")
        soup = scraper.clean_html(soup)
        nodes = scraper.extract_text_nodes(soup)
        
        # 2. Translate
        raw_texts = [node.string.strip() for node in nodes]
        translated_texts = translator.translate_text(raw_texts, request.target_language)
        rebuilder.rebuild_html(nodes, translated_texts)
        
        # 3. Upload HTML to Storage (Private Path)
        final_html = soup.prettify()
        storage_path = storage.upload_html(final_html)
        
        # 4. Save Metadata to DB (Calculates 24h vs 30d expiry)
        record = db.create_translation_record(
            user_id=user_id,
            original_url=str(request.url),
            target_lang=request.target_language,
            storage_path=storage_path
        )
        
        # 5. Return the "Render" link
        # The frontend will display this link to the user
        return {
            "translation_id": record["id"],
            "view_link": f"/render/{record['id']}",
            "expires_at": record["expires_at"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/render/{translation_id}", response_class=HTMLResponse)
def view_translation(translation_id: str):
    """
    The link shared with users. Checks DB expiry before serving content.
    """
    # 1. Check DB for validity
    record = db.get_translation(translation_id)
    if not record:
        return HTMLResponse(
            content="<h1>404 - Translation Not Found or Expired</h1>", 
            status_code=404
        )

    # 2. Fetch HTML from Storage
    try:
        html_content = storage.download_html(record["storage_path"])
        return HTMLResponse(content=html_content)
    except Exception:
        return HTMLResponse(content="<h1>Error loading translation file</h1>", status_code=500)

@app.get("/dashboard", response_model=list[DashboardItem])
def get_user_dashboard(user_id: str = Depends(require_auth)):
    """
    Returns history for logged-in users only.
    """
    records = db.get_user_translations(user_id)
    return [
        {
            "id": r["id"],
            "original_url": r["original_url"],
            "target_language": r["target_language"],
            "created_at": r["created_at"],
            "expires_at": r["expires_at"],
            "view_link": f"/render/{r['id']}"
        } 
        for r in records
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)