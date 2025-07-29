from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from datetime import datetime, date, timedelta
import uuid

from models.analytics import (
    PageView, PageViewCreate, UserEngagement, UserEngagementCreate,
    ArticleStats, AuthorStats, PlatformStats, TrendingArticle,
    UserSession, SearchQuery, ContentPerformance
)
from database import db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Page Views API
@router.post("/pageviews", response_model=PageView)
async def track_pageview(pageview_data: PageViewCreate, request: Request):
    """Track a page view"""
    
    # Get client IP
    client_ip = request.client.host if request.client else None
    
    # Get user agent
    user_agent = request.headers.get("user-agent")
    
    # Get referrer
    referrer = request.headers.get("referer")
    
    # Create page view with additional data
    pageview = PageView(
        **pageview_data.dict(),
        ip_address=client_ip,
        user_agent=user_agent,
        referrer=referrer
    )
    
    result = await db.pageviews.insert_one(pageview.dict())
    
    if result.inserted_id:
        # Update article stats
        await update_article_stats(pageview.article_id)
        
        return pageview
    else:
        raise HTTPException(status_code=500, detail="Failed to track pageview")

@router.get("/pageviews/article/{article_id}", response_model=List[PageView])
async def get_article_pageviews(article_id: str, limit: int = 100, offset: int = 0):
    """Get page views for an article"""
    
    cursor = db.pageviews.find({"article_id": article_id}).sort("created_at", -1).skip(offset).limit(limit)
    pageviews = await cursor.to_list(length=limit)
    
    return [PageView(**pv) for pv in pageviews]

# User Engagement API
@router.post("/engagement", response_model=UserEngagement)
async def track_engagement(engagement_data: UserEngagementCreate):
    """Track user engagement"""
    
    engagement = UserEngagement(**engagement_data.dict())
    
    result = await db.user_engagement.insert_one(engagement.dict())
    
    if result.inserted_id:
        # Update relevant stats based on action type
        await update_engagement_stats(engagement)
        
        return engagement
    else:
        raise HTTPException(status_code=500, detail="Failed to track engagement")

@router.get("/engagement/user/{wallet}", response_model=List[UserEngagement])
async def get_user_engagement(wallet: str, limit: int = 50, offset: int = 0):
    """Get engagement history for a user"""
    
    cursor = db.user_engagement.find({"user_wallet": wallet}).sort("created_at", -1).skip(offset).limit(limit)
    engagements = await cursor.to_list(length=limit)
    
    return [UserEngagement(**eng) for eng in engagements]

# Article Stats API
@router.get("/stats/article/{article_id}", response_model=ArticleStats)
async def get_article_stats(article_id: str):
    """Get comprehensive stats for an article"""
    
    # Get or create article stats
    stats = await db.article_stats.find_one({"article_id": article_id})
    
    if not stats:
        # Calculate initial stats
        stats = await calculate_article_stats(article_id)
        await db.article_stats.insert_one(stats.dict())
    
    return ArticleStats(**stats)

@router.get("/stats/articles/trending", response_model=List[TrendingArticle])
async def get_trending_articles(limit: int = 10):
    """Get trending articles in the last 24 hours"""
    
    # Calculate 24 hours ago
    yesterday = datetime.utcnow() - timedelta(days=1)
    
    # Get articles with high engagement in last 24h
    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": yesterday}
            }
        },
        {
            "$group": {
                "_id": "$article_id",
                "views_24h": {"$sum": 1},
                "likes_24h": {"$sum": {"$cond": [{"$eq": ["$action_type", "like"]}, 1, 0]}},
                "comments_24h": {"$sum": {"$cond": [{"$eq": ["$action_type", "comment"]}, 1, 0]}},
                "shares_24h": {"$sum": {"$cond": [{"$eq": ["$action_type", "share"]}, 1, 0]}}
            }
        },
        {
            "$sort": {"views_24h": -1}
        },
        {
            "$limit": limit
        }
    ]
    
    trending_data = await db.user_engagement.aggregate(pipeline).to_list(limit)
    
    # Enrich with article data
    trending_articles = []
    for data in trending_data:
        article = await db.articles.find_one({"id": data["_id"]})
        if article:
            engagement_score = (
                data["views_24h"] * 0.3 +
                data["likes_24h"] * 0.3 +
                data["comments_24h"] * 0.2 +
                data["shares_24h"] * 0.2
            )
            
            trending_article = TrendingArticle(
                article_id=data["_id"],
                title=article.get("title", "Untitled"),
                author_wallet=article.get("author_wallet", ""),
                author_name=article.get("author_name"),
                views_24h=data["views_24h"],
                likes_24h=data["likes_24h"],
                comments_24h=data["comments_24h"],
                shares_24h=data["shares_24h"],
                engagement_score=engagement_score
            )
            trending_articles.append(trending_article)
    
    return trending_articles

# Author Stats API
@router.get("/stats/author/{wallet}", response_model=AuthorStats)
async def get_author_stats(wallet: str):
    """Get comprehensive stats for an author"""
    
    # Get or create author stats
    stats = await db.author_stats.find_one({"author_wallet": wallet})
    
    if not stats:
        # Calculate initial stats
        stats = await calculate_author_stats(wallet)
        await db.author_stats.insert_one(stats.dict())
    
    return AuthorStats(**stats)

@router.get("/stats/authors/top", response_model=List[AuthorStats])
async def get_top_authors(limit: int = 10, metric: str = "total_views"):
    """Get top authors by various metrics"""
    
    valid_metrics = ["total_views", "total_likes", "total_revenue", "engagement_rate"]
    if metric not in valid_metrics:
        raise HTTPException(status_code=400, detail=f"Invalid metric. Must be one of: {valid_metrics}")
    
    cursor = db.author_stats.find().sort(metric, -1).limit(limit)
    authors = await cursor.to_list(length=limit)
    
    return [AuthorStats(**author) for author in authors]

# Platform Stats API
@router.get("/stats/platform", response_model=PlatformStats)
async def get_platform_stats():
    """Get platform-wide statistics"""
    
    today = date.today()
    
    # Get today's stats or create new ones
    stats = await db.platform_stats.find_one({"stats_date": today.isoformat()})
    
    if not stats:
        # Calculate platform stats
        stats = await calculate_platform_stats()
        await db.platform_stats.insert_one(stats.dict())
    
    return PlatformStats(**stats)

@router.get("/stats/platform/history", response_model=List[PlatformStats])
async def get_platform_stats_history(days: int = 30):
    """Get platform stats history"""
    
    start_date = date.today() - timedelta(days=days)
    
    cursor = db.platform_stats.find({"stats_date": {"$gte": start_date.isoformat()}}).sort("stats_date", -1)
    stats = await cursor.to_list(length=days)
    
    return [PlatformStats(**stat) for stat in stats]

# Search Analytics API
@router.post("/search", response_model=SearchQuery)
async def track_search_query(search_data: SearchQuery, request: Request):
    """Track search queries for analytics"""
    
    # Get client IP
    client_ip = request.client.host if request.client else None
    
    search_query = SearchQuery(
        **search_data.dict(),
        ip_address=client_ip
    )
    
    result = await db.search_queries.insert_one(search_query.dict())
    
    if result.inserted_id:
        return search_query
    else:
        raise HTTPException(status_code=500, detail="Failed to track search query")

@router.get("/search/popular", response_model=List[dict])
async def get_popular_searches(limit: int = 10, days: int = 7):
    """Get popular search queries"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": "$query",
                "count": {"$sum": 1},
                "avg_results": {"$avg": "$results_count"}
            }
        },
        {
            "$sort": {"count": -1}
        },
        {
            "$limit": limit
        }
    ]
    
    popular_searches = await db.search_queries.aggregate(pipeline).to_list(limit)
    
    return popular_searches

# Helper functions
async def update_article_stats(article_id: str):
    """Update article statistics"""
    
    # Count total views
    total_views = await db.pageviews.count_documents({"article_id": article_id})
    
    # Count unique views (by IP)
    unique_views = len(await db.pageviews.distinct("ip_address", {"article_id": article_id}))
    
    # Count engagement
    total_likes = await db.user_engagement.count_documents({
        "target_id": article_id,
        "target_type": "article",
        "action_type": "like"
    })
    
    total_comments = await db.user_engagement.count_documents({
        "target_id": article_id,
        "target_type": "article",
        "action_type": "comment"
    })
    
    total_shares = await db.user_engagement.count_documents({
        "target_id": article_id,
        "target_type": "article",
        "action_type": "share"
    })
    
    # Calculate engagement rate
    engagement_rate = (total_likes + total_comments + total_shares) / max(total_views, 1) * 100
    
    # Update or create stats
    stats_data = {
        "article_id": article_id,
        "total_views": total_views,
        "unique_views": unique_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "engagement_rate": engagement_rate
    }
    
    await db.article_stats.update_one(
        {"article_id": article_id},
        {"$set": stats_data},
        upsert=True
    )

async def update_engagement_stats(engagement: UserEngagement):
    """Update stats based on engagement action"""
    
    if engagement.target_type == "article":
        await update_article_stats(engagement.target_id)
    elif engagement.target_type == "author":
        await update_author_stats(engagement.target_id)

async def calculate_article_stats(article_id: str) -> ArticleStats:
    """Calculate comprehensive article statistics"""
    
    # Get basic stats
    total_views = await db.pageviews.count_documents({"article_id": article_id})
    unique_views = len(await db.pageviews.distinct("ip_address", {"article_id": article_id}))
    
    # Get engagement stats
    total_likes = await db.user_engagement.count_documents({
        "target_id": article_id,
        "target_type": "article",
        "action_type": "like"
    })
    
    total_comments = await db.user_engagement.count_documents({
        "target_id": article_id,
        "target_type": "article",
        "action_type": "comment"
    })
    
    total_shares = await db.user_engagement.count_documents({
        "target_id": article_id,
        "target_type": "article",
        "action_type": "share"
    })
    
    # Calculate engagement rate
    engagement_rate = (total_likes + total_comments + total_shares) / max(total_views, 1) * 100
    
    return ArticleStats(
        article_id=article_id,
        total_views=total_views,
        unique_views=unique_views,
        total_likes=total_likes,
        total_comments=total_comments,
        total_shares=total_shares,
        engagement_rate=engagement_rate
    )

async def calculate_author_stats(wallet: str) -> AuthorStats:
    """Calculate comprehensive author statistics"""
    
    # Get author's articles
    author_articles = await db.articles.find({"author_wallet": wallet}).to_list(1000)
    total_articles = len(author_articles)
    
    # Calculate total stats across all articles
    total_views = 0
    total_likes = 0
    total_comments = 0
    
    for article in author_articles:
        article_stats = await calculate_article_stats(article["id"])
        total_views += article_stats.total_views
        total_likes += article_stats.total_likes
        total_comments += article_stats.total_comments
    
    # Calculate averages
    avg_article_views = total_views / max(total_articles, 1)
    engagement_rate = (total_likes + total_comments) / max(total_views, 1) * 100
    
    return AuthorStats(
        author_wallet=wallet,
        total_articles=total_articles,
        total_views=total_views,
        total_likes=total_likes,
        total_comments=total_comments,
        avg_article_views=avg_article_views,
        engagement_rate=engagement_rate
    )

async def calculate_platform_stats() -> PlatformStats:
    """Calculate platform-wide statistics"""
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # Total counts
    total_users = len(await db.authors.distinct("wallet_address"))
    total_articles = await db.articles.count_documents({})
    total_views = await db.pageviews.count_documents({})
    total_likes = await db.user_engagement.count_documents({"action_type": "like"})
    total_comments = await db.user_engagement.count_documents({"action_type": "comment"})
    
    # Today's activity
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    active_users = len(await db.user_engagement.distinct("user_wallet", {
        "created_at": {"$gte": today_start, "$lte": today_end}
    }))
    
    new_users = await db.authors.count_documents({
        "created_at": {"$gte": today_start, "$lte": today_end}
    })
    
    new_articles = await db.articles.count_documents({
        "created_at": {"$gte": today_start, "$lte": today_end}
    })
    
    return PlatformStats(
        stats_date=today,
        total_users=total_users,
        total_articles=total_articles,
        total_views=total_views,
        total_likes=total_likes,
        total_comments=total_comments,
        active_users=active_users,
        new_users=new_users,
        new_articles=new_articles
    ) 