from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    author_wallet: str = Field(..., min_length=42, max_length=42)
    author_name: Optional[str] = Field(None, max_length=100)
    parent_id: Optional[str] = Field(None)  # For threaded comments
    article_id: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class Comment(CommentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = Field(default=0)
    dislikes: int = Field(default=0)
    replies: List[str] = Field(default_factory=list)  # Comment IDs
    is_edited: bool = Field(default=False)
    is_deleted: bool = Field(default=False)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CommentResponse(Comment):
    replies_data: List['CommentResponse'] = Field(default_factory=list)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ReactionBase(BaseModel):
    user_wallet: str = Field(..., min_length=42, max_length=42)
    comment_id: str = Field(..., min_length=1)
    reaction_type: str = Field(..., regex="^(like|dislike|love|laugh|wow|sad|angry)$")

class ReactionCreate(ReactionBase):
    pass

class Reaction(ReactionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 