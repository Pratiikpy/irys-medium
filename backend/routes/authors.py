from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from models.author import AuthorProfile, AuthorProfileCreate, AuthorProfileUpdate
from database import db

router = APIRouter(prefix="/api/authors", tags=["authors"])


@router.post("/", response_model=AuthorProfile)
async def create_author_profile(profile_data: AuthorProfileCreate):
    """Create a new author profile"""
    
    # Check if profile already exists
    existing_profile = await db.authors.find_one({"wallet_address": profile_data.wallet_address})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists for this wallet address")
    
    # Create new profile
    profile = AuthorProfile(
        wallet_address=profile_data.wallet_address,
        username=profile_data.username,
        display_name=profile_data.display_name,
        bio=profile_data.bio,
        social_links=profile_data.social_links
    )
    
    # Insert into MongoDB
    result = await db.authors.insert_one(profile.dict())
    
    if result.inserted_id:
        return profile
    else:
        raise HTTPException(status_code=500, detail="Failed to create profile")


@router.get("/{wallet_address}", response_model=AuthorProfile)
async def get_author_profile(wallet_address: str):
    """Get author profile by wallet address"""
    
    profile = await db.authors.find_one({"wallet_address": wallet_address})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return AuthorProfile(**profile)


@router.put("/{wallet_address}", response_model=AuthorProfile)
async def update_author_profile(wallet_address: str, profile_update: AuthorProfileUpdate):
    """Update author profile"""
    
    # Build update data (exclude None values)
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.authors.update_one(
        {"wallet_address": wallet_address},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Return updated profile
    updated_profile = await db.authors.find_one({"wallet_address": wallet_address})
    if updated_profile:
        return AuthorProfile(**updated_profile)
    else:
        raise HTTPException(status_code=404, detail="Profile not found")


@router.get("/", response_model=List[AuthorProfile])
async def get_all_authors(limit: int = 20, offset: int = 0):
    """Get all author profiles"""
    
    cursor = db.authors.find().sort("created_at", -1).skip(offset).limit(limit)
    authors = await cursor.to_list(length=limit)
    
    return [AuthorProfile(**author) for author in authors]


@router.post("/{wallet_address}/stats/article")
async def increment_article_count(wallet_address: str):
    """Increment article count for author (called when new article is published)"""
    
    result = await db.authors.update_one(
        {"wallet_address": wallet_address},
        {"$inc": {"total_articles": 1}}
    )
    
    if result.modified_count == 0:
        # Profile doesn't exist, create a basic one
        profile = AuthorProfile(
            wallet_address=wallet_address,
            total_articles=1
        )
        await db.authors.insert_one(profile.dict())
    
    return {"message": "Article count updated"}


@router.post("/{wallet_address}/stats/views")
async def increment_view_count(wallet_address: str, views: int = 1):
    """Increment view count for author"""
    
    result = await db.authors.update_one(
        {"wallet_address": wallet_address},
        {"$inc": {"total_views": views}}
    )
    
    if result.modified_count == 0:
        # Profile doesn't exist, create a basic one
        profile = AuthorProfile(
            wallet_address=wallet_address,
            total_views=views
        )
        await db.authors.insert_one(profile.dict())
    
    return {"message": "View count updated"}