from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class Article(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str  # Markdown content
    html: str  # Rendered HTML
    excerpt: str
    author_wallet: str
    author_name: Optional[str] = None
    
    # Irys storage
    irys_id: str  # Transaction ID from Irys
    irys_url: str  # Gateway URL for permanent access
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    category: str = "General"
    reading_time: int = 0  # in minutes
    word_count: int = 0
    
    # Publishing info
    status: str = "published"  # draft, published
    published_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Stats
    views: int = 0


class ArticleCreate(BaseModel):
    title: str
    content: str
    html: str
    excerpt: str
    author_wallet: str
    author_name: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category: str = "General"


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    html: Optional[str] = None
    excerpt: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    status: Optional[str] = None


class ArticleResponse(BaseModel):
    id: str
    title: str
    excerpt: str
    author_wallet: str
    author_name: Optional[str]
    irys_id: str
    irys_url: str
    tags: List[str]
    category: str
    reading_time: int
    word_count: int
    published_at: datetime
    views: int


class ArticleSearchQuery(BaseModel):
    query: Optional[str] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    limit: int = 20
    offset: int = 0