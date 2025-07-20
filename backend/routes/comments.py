from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from models.comment import Comment, CommentCreate, CommentUpdate, CommentResponse, Reaction, ReactionCreate
from database import db

router = APIRouter(prefix="/api/comments", tags=["comments"])

@router.post("/", response_model=CommentResponse)
async def create_comment(comment_data: CommentCreate):
    """Create a new comment"""
    
    comment = Comment(**comment_data.dict())
    
    # Insert into MongoDB
    result = await db.comments.insert_one(comment.dict())
    
    if result.inserted_id:
        # Update article comment count
        await db.articles.update_one(
            {"id": comment.article_id},
            {"$inc": {"comment_count": 1}}
        )
        
        return CommentResponse(**comment.dict())
    else:
        raise HTTPException(status_code=500, detail="Failed to create comment")

@router.get("/article/{article_id}", response_model=List[CommentResponse])
async def get_article_comments(article_id: str, limit: int = 50, offset: int = 0):
    """Get comments for an article"""
    
    # Get top-level comments (no parent_id)
    cursor = db.comments.find({
        "article_id": article_id,
        "parent_id": None,
        "is_deleted": False
    }).sort("created_at", -1).skip(offset).limit(limit)
    
    comments = await cursor.to_list(length=limit)
    
    # Get replies for each comment
    result_comments = []
    for comment in comments:
        comment_obj = CommentResponse(**comment)
        
        # Get replies
        replies_cursor = db.comments.find({
            "parent_id": comment["id"],
            "is_deleted": False
        }).sort("created_at", 1)
        
        replies = await replies_cursor.to_list(length=100)
        comment_obj.replies_data = [CommentResponse(**reply) for reply in replies]
        
        result_comments.append(comment_obj)
    
    return result_comments

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(comment_id: str, comment_update: CommentUpdate):
    """Update a comment"""
    
    update_data = {
        "content": comment_update.content,
        "updated_at": datetime.utcnow(),
        "is_edited": True
    }
    
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Fetch and return updated comment
    updated_comment = await db.comments.find_one({"id": comment_id})
    if updated_comment:
        return CommentResponse(**updated_comment)
    else:
        raise HTTPException(status_code=404, detail="Comment not found")

@router.delete("/{comment_id}")
async def delete_comment(comment_id: str):
    """Soft delete a comment"""
    
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return {"message": "Comment deleted successfully"}

@router.post("/{comment_id}/reactions", response_model=Reaction)
async def add_reaction(comment_id: str, reaction_data: ReactionCreate):
    """Add a reaction to a comment"""
    
    # Check if reaction already exists
    existing_reaction = await db.reactions.find_one({
        "user_wallet": reaction_data.user_wallet,
        "comment_id": comment_id
    })
    
    if existing_reaction:
        # Update existing reaction
        result = await db.reactions.update_one(
            {"id": existing_reaction["id"]},
            {"$set": {
                "reaction_type": reaction_data.reaction_type,
                "created_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count > 0:
            # Update comment reaction counts
            await update_comment_reaction_counts(comment_id)
            
            updated_reaction = await db.reactions.find_one({"id": existing_reaction["id"]})
            return Reaction(**updated_reaction)
    else:
        # Create new reaction
        reaction = Reaction(**reaction_data.dict())
        
        result = await db.reactions.insert_one(reaction.dict())
        
        if result.inserted_id:
            # Update comment reaction counts
            await update_comment_reaction_counts(comment_id)
            
            return reaction
    
    raise HTTPException(status_code=500, detail="Failed to add reaction")

@router.delete("/{comment_id}/reactions/{user_wallet}")
async def remove_reaction(comment_id: str, user_wallet: str):
    """Remove a reaction from a comment"""
    
    result = await db.reactions.delete_one({
        "comment_id": comment_id,
        "user_wallet": user_wallet
    })
    
    if result.deleted_count > 0:
        # Update comment reaction counts
        await update_comment_reaction_counts(comment_id)
        return {"message": "Reaction removed successfully"}
    else:
        raise HTTPException(status_code=404, detail="Reaction not found")

async def update_comment_reaction_counts(comment_id: str):
    """Update reaction counts for a comment"""
    
    # Count likes
    likes_count = await db.reactions.count_documents({
        "comment_id": comment_id,
        "reaction_type": "like"
    })
    
    # Count dislikes
    dislikes_count = await db.reactions.count_documents({
        "comment_id": comment_id,
        "reaction_type": "dislike"
    })
    
    # Update comment
    await db.comments.update_one(
        {"id": comment_id},
        {"$set": {
            "likes": likes_count,
            "dislikes": dislikes_count
        }}
    ) 