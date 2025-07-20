from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid

class PageViewBase(BaseModel):
    article_id: str = Field(..., min_length=1)
    user_wallet: Optional[str] = Field(None, min_length=42, max_length=42)
    ip_address: Optional[str] = Field(None, max_length=45)
    user_agent: Optional[str] = Field(None, max_length=500)
    referrer: Optional[str] = Field(None, max_length=500)
    session_id: Optional[str] = Field(None, max_length=100)

class PageViewCreate(PageViewBase):
    pass

class PageView(PageViewBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    view_date: date = Field(default_factory=date.today)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

class UserEngagementBase(BaseModel):
    user_wallet: str = Field(..., min_length=42, max_length=42)
    action_type: str = Field(..., pattern="^(view|like|comment|share|tip|purchase|subscribe)$")
    target_id: str = Field(..., min_length=1)  # article_id, comment_id, etc.
    target_type: str = Field(..., pattern="^(article|comment|author|nft)$")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class UserEngagementCreate(UserEngagementBase):
    pass

class UserEngagement(UserEngagementBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    engagement_date: date = Field(default_factory=date.today)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

class ArticleStats(BaseModel):
    article_id: str = Field(..., min_length=1)
    total_views: int = Field(default=0)
    unique_views: int = Field(default=0)
    total_likes: int = Field(default=0)
    total_comments: int = Field(default=0)
    total_shares: int = Field(default=0)
    total_tips: int = Field(default=0)
    total_tip_amount: float = Field(default=0.0)
    avg_time_on_page: float = Field(default=0.0)  # seconds
    bounce_rate: float = Field(default=0.0)  # percentage
    engagement_rate: float = Field(default=0.0)  # percentage
    
    class Config:
        json_encoders = {
            float: lambda v: round(v, 2)
        }

class AuthorStats(BaseModel):
    author_wallet: str = Field(..., min_length=42, max_length=42)
    total_articles: int = Field(default=0)
    total_views: int = Field(default=0)
    total_likes: int = Field(default=0)
    total_comments: int = Field(default=0)
    total_followers: int = Field(default=0)
    total_tips_received: int = Field(default=0)
    total_tip_amount: float = Field(default=0.0)
    total_revenue: float = Field(default=0.0)
    avg_article_views: float = Field(default=0.0)
    engagement_rate: float = Field(default=0.0)  # percentage
    
    class Config:
        json_encoders = {
            float: lambda v: round(v, 2)
        }

class PlatformStats(BaseModel):
    stats_date: date = Field(default_factory=date.today)
    total_users: int = Field(default=0)
    total_articles: int = Field(default=0)
    total_views: int = Field(default=0)
    total_likes: int = Field(default=0)
    total_comments: int = Field(default=0)
    total_tips: int = Field(default=0)
    total_tip_amount: float = Field(default=0.0)
    total_revenue: float = Field(default=0.0)
    active_users: int = Field(default=0)  # users active in last 24h
    new_users: int = Field(default=0)  # new users in last 24h
    new_articles: int = Field(default=0)  # new articles in last 24h
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat(),
            float: lambda v: round(v, 2)
        }

class TrendingArticle(BaseModel):
    article_id: str = Field(..., min_length=1)
    title: str = Field(..., max_length=200)
    author_wallet: str = Field(..., min_length=42, max_length=42)
    author_name: Optional[str] = Field(None, max_length=100)
    views_24h: int = Field(default=0)
    likes_24h: int = Field(default=0)
    comments_24h: int = Field(default=0)
    shares_24h: int = Field(default=0)
    engagement_score: float = Field(default=0.0)
    trend_direction: str = Field(default="stable", pattern="^(up|down|stable)$")
    
    class Config:
        json_encoders = {
            float: lambda v: round(v, 2)
        }

class UserSession(BaseModel):
    session_id: str = Field(..., min_length=1)
    user_wallet: Optional[str] = Field(None, min_length=42, max_length=42)
    ip_address: Optional[str] = Field(None, max_length=45)
    user_agent: Optional[str] = Field(None, max_length=500)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(None)
    duration: Optional[int] = Field(None)  # seconds
    pages_visited: int = Field(default=0)
    actions_performed: int = Field(default=0)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SearchQuery(BaseModel):
    query: str = Field(..., max_length=500)
    user_wallet: Optional[str] = Field(None, min_length=42, max_length=42)
    ip_address: Optional[str] = Field(None, max_length=45)
    results_count: int = Field(default=0)
    filters_used: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ContentPerformance(BaseModel):
    content_id: str = Field(..., min_length=1)
    content_type: str = Field(..., pattern="^(article|comment|nft)$")
    views: int = Field(default=0)
    likes: int = Field(default=0)
    comments: int = Field(default=0)
    shares: int = Field(default=0)
    engagement_rate: float = Field(default=0.0)
    viral_coefficient: float = Field(default=0.0)  # how likely content is to be shared
    retention_score: float = Field(default=0.0)  # how well content retains readers
    
    class Config:
        json_encoders = {
            float: lambda v: round(v, 4)
        } 