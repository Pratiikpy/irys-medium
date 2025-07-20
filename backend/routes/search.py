from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

from models.article import ArticleResponse, ArticleSearchQuery
from routes.articles import search_articles

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchSuggestion(BaseModel):
    query: str
    count: int


class SearchStats(BaseModel):
    total_articles: int
    total_authors: int
    popular_tags: List[str]
    recent_searches: List[str]


@router.get("/suggestions")
async def get_search_suggestions(q: str = "", limit: int = 5):
    """Get search suggestions based on partial query"""
    
    suggestions = []
    
    if len(q) >= 2:
        # For now, return basic suggestions
        # In a real implementation, you'd query your database for popular searches
        common_queries = [
            "blockchain", "web3", "defi", "nft", "ethereum", 
            "crypto", "smart contracts", "decentralized", "mirror", "irys"
        ]
        
        matching = [query for query in common_queries if q.lower() in query.lower()]
        suggestions = [{"query": query, "count": 0} for query in matching[:limit]]
    
    return suggestions


@router.get("/stats", response_model=SearchStats)
async def get_search_stats():
    """Get search and discovery statistics"""
    
    # For now, return placeholder data
    # In a real implementation, you'd query your database
    return SearchStats(
        total_articles=0,
        total_authors=0,
        popular_tags=["blockchain", "web3", "defi", "nft", "ethereum"],
        recent_searches=["blockchain tutorial", "web3 development", "irys storage"]
    )


@router.get("/tags")
async def get_popular_tags(limit: int = 20):
    """Get popular tags for filtering"""
    
    # For now, return common Web3 tags
    # In a real implementation, you'd aggregate from your articles
    popular_tags = [
        "blockchain", "web3", "defi", "nft", "ethereum", "bitcoin",
        "smart-contracts", "dao", "crypto", "decentralized", "mirror",
        "irys", "arweave", "permanent-storage", "publishing"
    ]
    
    return popular_tags[:limit]


@router.get("/categories")
async def get_categories():
    """Get available article categories"""
    
    return [
        "Technology",
        "Blockchain",
        "Web3",
        "DeFi",
        "NFTs",
        "DAOs",
        "Crypto",
        "Development",
        "Tutorial",
        "Opinion",
        "News",
        "General"
    ]