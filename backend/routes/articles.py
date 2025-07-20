from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from models.article import Article, ArticleCreate, ArticleUpdate, ArticleResponse, ArticleSearchQuery
from services.irys_service import irys_service
from database import db

router = APIRouter(prefix="/api/articles", tags=["articles"])

def calculate_reading_time(content: str) -> int:
    """Calculate reading time in minutes (avg 200 words per minute)"""
    word_count = len(content.split())
    return max(1, word_count // 200)

def calculate_word_count(content: str) -> int:
    """Calculate word count"""
    return len(content.split())

def create_excerpt(content: str, max_length: int = 200) -> str:
    """Create an excerpt from content"""
    if len(content) <= max_length:
        return content
    
    # Find the last complete word within the limit
    excerpt = content[:max_length]
    last_space = excerpt.rfind(' ')
    if last_space > 0:
        excerpt = excerpt[:last_space]
    
    return excerpt + "..."


@router.post("/", response_model=ArticleResponse)
async def create_article(article_data: ArticleCreate):
    """Create a new article (metadata only - actual upload to Irys happens on frontend)"""
    
    # Calculate additional fields
    reading_time = calculate_reading_time(article_data.content)
    word_count = calculate_word_count(article_data.content)
    
    # Create excerpt if not provided
    excerpt = article_data.excerpt
    if not excerpt:
        excerpt = create_excerpt(article_data.content)
    
    article = Article(
        title=article_data.title,
        content=article_data.content,
        html=article_data.html,
        excerpt=excerpt,
        author_wallet=article_data.author_wallet,
        author_name=article_data.author_name,
        tags=article_data.tags,
        category=article_data.category,
        reading_time=reading_time,
        word_count=word_count,
        irys_id="",  # Will be updated after Irys upload
        irys_url=""   # Will be updated after Irys upload
    )
    
    # Insert into MongoDB
    result = await db.articles.insert_one(article.dict())
    
    if result.inserted_id:
        return ArticleResponse(**article.dict())
    else:
        raise HTTPException(status_code=500, detail="Failed to create article")


@router.put("/{article_id}/irys", response_model=ArticleResponse)
async def update_article_irys_id(article_id: str, irys_id: str, irys_url: str):
    """Update article with Irys transaction ID after successful upload"""
    
    update_data = {
        "irys_id": irys_id,
        "irys_url": irys_url,
        "updated_at": datetime.utcnow()
    }
    
    result = await db.articles.update_one(
        {"id": article_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Fetch and return updated article
    updated_article = await db.articles.find_one({"id": article_id})
    if updated_article:
        return ArticleResponse(**updated_article)
    else:
        raise HTTPException(status_code=404, detail="Article not found")


@router.get("/", response_model=List[ArticleResponse])
async def get_articles(limit: int = 20, offset: int = 0):
    """Get recent articles"""
    
    # First try to get from our database
    cursor = db.articles.find({"status": "published"}).sort("published_at", -1).skip(offset).limit(limit)
    articles = await cursor.to_list(length=limit)
    
    if articles:
        return [ArticleResponse(**article) for article in articles]
    
    # If no articles in database, query from Irys directly
    try:
        irys_articles = await irys_service.query_recent_articles(limit)
        result_articles = []
        
        for tx_data in irys_articles:
            parsed = irys_service.parse_irys_transaction(tx_data)
            
            # Try to get full content
            content_data = await irys_service.get_article_content(parsed["irys_id"])
            
            article_response = ArticleResponse(
                id=parsed["irys_id"],
                title=parsed["title"] or content_data.get("title", "Untitled"),
                excerpt=content_data.get("excerpt", "No excerpt available"),
                author_wallet=parsed["author"],
                author_name=content_data.get("author_name"),
                irys_id=parsed["irys_id"],
                irys_url=parsed["gateway_url"],
                tags=parsed["tags"],
                category=parsed["category"],
                reading_time=content_data.get("reading_time", 1),
                word_count=content_data.get("word_count", 0),
                published_at=datetime.fromtimestamp(int(parsed["timestamp"]) / 1000) if parsed["timestamp"] else datetime.utcnow(),
                views=0
            )
            result_articles.append(article_response)
        
        return result_articles
    except Exception as e:
        print(f"Error fetching articles: {e}")
        return []


@router.get("/{article_id}", response_model=Article)
async def get_article(article_id: str):
    """Get article by ID (try database first, then Irys)"""
    
    # Try database first
    article = await db.articles.find_one({"id": article_id})
    if article:
        # Increment views
        await db.articles.update_one(
            {"id": article_id},
            {"$inc": {"views": 1}}
        )
        return Article(**article)
    
    # Try Irys by treating article_id as irys_id
    try:
        content_data = await irys_service.get_article_content(article_id)
        if content_data:
            # Create a temporary Article object from Irys data
            article = Article(
                id=article_id,
                title=content_data.get("title", "Untitled"),
                content=content_data.get("content", ""),
                html=content_data.get("html", ""),
                excerpt=content_data.get("excerpt", "No excerpt available"),
                author_wallet=content_data.get("author", "Unknown"),
                author_name=content_data.get("author_name"),
                irys_id=article_id,
                irys_url=irys_service.get_gateway_url(article_id),
                tags=content_data.get("tags", []),
                category=content_data.get("category", "General"),
                reading_time=content_data.get("reading_time", 1),
                word_count=content_data.get("word_count", 0),
                published_at=content_data.get("published_at", datetime.utcnow()),
                views=1
            )
            return article
    except Exception as e:
        print(f"Error fetching from Irys: {e}")
    
    raise HTTPException(status_code=404, detail="Article not found")


@router.get("/author/{author_wallet}", response_model=List[ArticleResponse])
async def get_articles_by_author(author_wallet: str, limit: int = 20, offset: int = 0):
    """Get articles by author wallet address"""
    
    # Try database first
    cursor = db.articles.find({"author_wallet": author_wallet, "status": "published"}).sort("published_at", -1).skip(offset).limit(limit)
    articles = await cursor.to_list(length=limit)
    
    if articles:
        return [ArticleResponse(**article) for article in articles]
    
    # Query from Irys
    try:
        irys_articles = await irys_service.query_articles_by_author(author_wallet, limit)
        result_articles = []
        
        for tx_data in irys_articles:
            parsed = irys_service.parse_irys_transaction(tx_data)
            content_data = await irys_service.get_article_content(parsed["irys_id"])
            
            article_response = ArticleResponse(
                id=parsed["irys_id"],
                title=parsed["title"] or content_data.get("title", "Untitled"),
                excerpt=content_data.get("excerpt", "No excerpt available"),
                author_wallet=parsed["author"],
                author_name=content_data.get("author_name"),
                irys_id=parsed["irys_id"],
                irys_url=parsed["gateway_url"],
                tags=parsed["tags"],
                category=parsed["category"],
                reading_time=content_data.get("reading_time", 1),
                word_count=content_data.get("word_count", 0),
                published_at=datetime.fromtimestamp(int(parsed["timestamp"]) / 1000) if parsed["timestamp"] else datetime.utcnow(),
                views=0
            )
            result_articles.append(article_response)
        
        return result_articles
    except Exception as e:
        print(f"Error fetching articles by author: {e}")
        return []


@router.post("/search", response_model=List[ArticleResponse])
async def search_articles(search_query: ArticleSearchQuery):
    """Search articles by various criteria"""
    
    # Build MongoDB query
    mongo_query = {"status": "published"}
    
    if search_query.query:
        # Full text search on title and content
        mongo_query["$or"] = [
            {"title": {"$regex": search_query.query, "$options": "i"}},
            {"content": {"$regex": search_query.query, "$options": "i"}},
            {"excerpt": {"$regex": search_query.query, "$options": "i"}}
        ]
    
    if search_query.author:
        mongo_query["author_wallet"] = search_query.author
    
    if search_query.tags:
        mongo_query["tags"] = {"$in": search_query.tags}
    
    if search_query.category:
        mongo_query["category"] = search_query.category
    
    # Search in database
    cursor = db.articles.find(mongo_query).sort("published_at", -1).skip(search_query.offset).limit(search_query.limit)
    articles = await cursor.to_list(length=search_query.limit)
    
    result = [ArticleResponse(**article) for article in articles]
    
    # If no results from database and we have tags, try Irys
    if not result and search_query.tags:
        try:
            irys_articles = await irys_service.search_articles_by_tags(search_query.tags, search_query.limit)
            
            for tx_data in irys_articles:
                parsed = irys_service.parse_irys_transaction(tx_data)
                content_data = await irys_service.get_article_content(parsed["irys_id"])
                
                article_response = ArticleResponse(
                    id=parsed["irys_id"],
                    title=parsed["title"] or content_data.get("title", "Untitled"),
                    excerpt=content_data.get("excerpt", "No excerpt available"),
                    author_wallet=parsed["author"],
                    author_name=content_data.get("author_name"),
                    irys_id=parsed["irys_id"],
                    irys_url=parsed["gateway_url"],
                    tags=parsed["tags"],
                    category=parsed["category"],
                    reading_time=content_data.get("reading_time", 1),
                    word_count=content_data.get("word_count", 0),
                    published_at=datetime.fromtimestamp(int(parsed["timestamp"]) / 1000) if parsed["timestamp"] else datetime.utcnow(),
                    views=0
                )
                result.append(article_response)
        except Exception as e:
            print(f"Error searching Irys: {e}")
    
    return result