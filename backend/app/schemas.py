from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
import uuid

class TranslationRequest(BaseModel):
    url: HttpUrl
    target_language: str

class TranslationResponse(BaseModel):
    translation_id: str
    view_link: str
    expires_at: datetime

class DashboardItem(BaseModel):
    id: uuid.UUID
    original_url: str
    target_language: str
    created_at: datetime
    expires_at: datetime
    view_link: str