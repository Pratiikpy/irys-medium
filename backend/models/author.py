from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class AuthorProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_irys_id: Optional[str] = None
    cover_image_irys_id: Optional[str] = None
    social_links: dict = Field(default_factory=dict)  # {"twitter": "@handle", "website": "url"}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Stats
    total_articles: int = 0
    total_views: int = 0


class AuthorProfileCreate(BaseModel):
    wallet_address: str
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    social_links: dict = Field(default_factory=dict)


class AuthorProfileUpdate(BaseModel):
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_irys_id: Optional[str] = None
    cover_image_irys_id: Optional[str] = None
    social_links: Optional[dict] = None