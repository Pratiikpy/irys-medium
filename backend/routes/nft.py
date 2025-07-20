from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from models.nft import (
    NFT, NFTCreate, NFTUpdate, NFTSale, NFTSaleCreate,
    NFTCollection, NFTCollectionCreate, NFTStats
)
from database import db

router = APIRouter(prefix="/api/nft", tags=["nft"])

# NFT Management API
@router.post("/", response_model=NFT)
async def create_nft(nft_data: NFTCreate):
    """Create a new NFT for an article"""
    
    # Check if article exists
    article = await db.articles.find_one({"id": nft_data.article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if NFT already exists for this article
    existing = await db.nfts.find_one({"article_id": nft_data.article_id})
    if existing:
        raise HTTPException(status_code=400, detail="NFT already exists for this article")
    
    nft = NFT(**nft_data.dict())
    
    result = await db.nfts.insert_one(nft.dict())
    
    if result.inserted_id:
        return nft
    else:
        raise HTTPException(status_code=500, detail="Failed to create NFT")

@router.get("/{nft_id}", response_model=NFT)
async def get_nft(nft_id: str):
    """Get NFT by ID"""
    
    nft = await db.nfts.find_one({"id": nft_id})
    
    if not nft:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    return NFT(**nft)

@router.get("/article/{article_id}", response_model=NFT)
async def get_nft_by_article(article_id: str):
    """Get NFT by article ID"""
    
    nft = await db.nfts.find_one({"article_id": article_id})
    
    if not nft:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    return NFT(**nft)

@router.put("/{nft_id}", response_model=NFT)
async def update_nft(nft_id: str, update_data: NFTUpdate):
    """Update NFT"""
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.nfts.update_one(
        {"id": nft_id},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    # Fetch and return updated NFT
    updated_nft = await db.nfts.find_one({"id": nft_id})
    if updated_nft:
        return NFT(**updated_nft)
    else:
        raise HTTPException(status_code=404, detail="NFT not found")

@router.post("/{nft_id}/mint")
async def mint_nft(nft_id: str, transaction_hash: str):
    """Mark NFT as minted"""
    
    result = await db.nfts.update_one(
        {"id": nft_id},
        {"$set": {
            "is_minted": True,
            "mint_transaction_hash": transaction_hash,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    return {"message": "NFT marked as minted successfully"}

# NFT Marketplace API
@router.get("/marketplace/listed", response_model=List[NFT])
async def get_listed_nfts(limit: int = 20, offset: int = 0, min_price: float = 0, max_price: float = None):
    """Get listed NFTs for marketplace"""
    
    query = {"is_listed": True, "is_minted": True}
    
    if min_price > 0:
        query["price"] = {"$gte": min_price}
    
    if max_price:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    
    cursor = db.nfts.find(query).sort("created_at", -1).skip(offset).limit(limit)
    nfts = await cursor.to_list(length=limit)
    
    return [NFT(**nft) for nft in nfts]

@router.get("/marketplace/creator/{wallet}", response_model=List[NFT])
async def get_creator_nfts(wallet: str, limit: int = 20, offset: int = 0):
    """Get NFTs created by a wallet"""
    
    cursor = db.nfts.find({"creator_wallet": wallet}).sort("created_at", -1).skip(offset).limit(limit)
    nfts = await cursor.to_list(length=limit)
    
    return [NFT(**nft) for nft in nfts]

@router.post("/marketplace/list/{nft_id}")
async def list_nft(nft_id: str, price: float, currency: str = "ETH"):
    """List NFT for sale"""
    
    if price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
    
    result = await db.nfts.update_one(
        {"id": nft_id},
        {"$set": {
            "is_listed": True,
            "price": price,
            "currency": currency,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    return {"message": "NFT listed successfully"}

@router.post("/marketplace/unlist/{nft_id}")
async def unlist_nft(nft_id: str):
    """Unlist NFT from marketplace"""
    
    result = await db.nfts.update_one(
        {"id": nft_id},
        {"$set": {
            "is_listed": False,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    return {"message": "NFT unlisted successfully"}

# NFT Sales API
@router.post("/sales", response_model=NFTSale)
async def create_nft_sale(sale_data: NFTSaleCreate):
    """Create an NFT sale record"""
    
    sale = NFTSale(**sale_data.dict())
    
    result = await db.nft_sales.insert_one(sale.dict())
    
    if result.inserted_id:
        # Update NFT stats
        await db.nfts.update_one(
            {"id": sale.nft_id},
            {"$inc": {
                "total_sales": 1,
                "total_volume": sale.price
            }}
        )
        
        # Unlist the NFT after sale
        await db.nfts.update_one(
            {"id": sale.nft_id},
            {"$set": {"is_listed": False}}
        )
        
        return sale
    else:
        raise HTTPException(status_code=500, detail="Failed to create sale")

@router.get("/sales/{nft_id}", response_model=List[NFTSale])
async def get_nft_sales(nft_id: str, limit: int = 20, offset: int = 0):
    """Get sales history for an NFT"""
    
    cursor = db.nft_sales.find({"nft_id": nft_id}).sort("created_at", -1).skip(offset).limit(limit)
    sales = await cursor.to_list(length=limit)
    
    return [NFTSale(**sale) for sale in sales]

@router.get("/sales/user/{wallet}", response_model=List[NFTSale])
async def get_user_sales(wallet: str, limit: int = 20, offset: int = 0):
    """Get sales by a user (as buyer or seller)"""
    
    cursor = db.nft_sales.find({
        "$or": [
            {"buyer_wallet": wallet},
            {"seller_wallet": wallet}
        ]
    }).sort("created_at", -1).skip(offset).limit(limit)
    
    sales = await cursor.to_list(length=limit)
    
    return [NFTSale(**sale) for sale in sales]

# NFT Collections API
@router.post("/collections", response_model=NFTCollection)
async def create_collection(collection_data: NFTCollectionCreate):
    """Create a new NFT collection"""
    
    collection = NFTCollection(**collection_data.dict())
    
    result = await db.nft_collections.insert_one(collection.dict())
    
    if result.inserted_id:
        return collection
    else:
        raise HTTPException(status_code=500, detail="Failed to create collection")

@router.get("/collections", response_model=List[NFTCollection])
async def get_collections(limit: int = 20, offset: int = 0):
    """Get all collections"""
    
    cursor = db.nft_collections.find().sort("created_at", -1).skip(offset).limit(limit)
    collections = await cursor.to_list(length=limit)
    
    return [NFTCollection(**collection) for collection in collections]

@router.get("/collections/{collection_id}", response_model=NFTCollection)
async def get_collection(collection_id: str):
    """Get collection by ID"""
    
    collection = await db.nft_collections.find_one({"id": collection_id})
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return NFTCollection(**collection)

@router.get("/collections/creator/{wallet}", response_model=List[NFTCollection])
async def get_creator_collections(wallet: str, limit: int = 20, offset: int = 0):
    """Get collections by creator"""
    
    cursor = db.nft_collections.find({"creator_wallet": wallet}).sort("created_at", -1).skip(offset).limit(limit)
    collections = await cursor.to_list(length=limit)
    
    return [NFTCollection(**collection) for collection in collections]

# NFT Stats API
@router.get("/stats/global", response_model=NFTStats)
async def get_global_nft_stats():
    """Get global NFT statistics"""
    
    # Count total NFTs
    total_nfts = await db.nfts.count_documents({})
    
    # Calculate total volume
    pipeline = [
        {"$group": {"_id": None, "total_volume": {"$sum": "$total_volume"}}}
    ]
    volume_result = await db.nfts.aggregate(pipeline).to_list(1)
    total_volume = volume_result[0]["total_volume"] if volume_result else 0.0
    
    # Count total sales
    total_sales = await db.nft_sales.count_documents({})
    
    # Calculate floor price (lowest listed price)
    listed_nfts = await db.nfts.find({"is_listed": True, "price": {"$gt": 0}}).sort("price", 1).limit(1).to_list(1)
    floor_price = listed_nfts[0]["price"] if listed_nfts else None
    
    # Count unique owners (distinct buyer wallets)
    unique_owners = len(await db.nft_sales.distinct("buyer_wallet"))
    
    # Calculate average price
    pipeline = [
        {"$match": {"price": {"$gt": 0}}},
        {"$group": {"_id": None, "avg_price": {"$avg": "$price"}}}
    ]
    avg_result = await db.nfts.aggregate(pipeline).to_list(1)
    average_price = avg_result[0]["avg_price"] if avg_result else 0.0
    
    stats = NFTStats(
        total_nfts=total_nfts,
        total_volume=total_volume,
        total_sales=total_sales,
        floor_price=floor_price,
        unique_owners=unique_owners,
        average_price=average_price
    )
    
    return stats

@router.get("/stats/creator/{wallet}", response_model=NFTStats)
async def get_creator_nft_stats(wallet: str):
    """Get NFT statistics for a creator"""
    
    # Count creator's NFTs
    total_nfts = await db.nfts.count_documents({"creator_wallet": wallet})
    
    # Calculate creator's total volume
    pipeline = [
        {"$match": {"creator_wallet": wallet}},
        {"$group": {"_id": None, "total_volume": {"$sum": "$total_volume"}}}
    ]
    volume_result = await db.nfts.aggregate(pipeline).to_list(1)
    total_volume = volume_result[0]["total_volume"] if volume_result else 0.0
    
    # Count creator's sales
    creator_nfts = await db.nfts.find({"creator_wallet": wallet}).distinct("id")
    total_sales = await db.nft_sales.count_documents({"nft_id": {"$in": creator_nfts}})
    
    # Calculate creator's floor price
    listed_nfts = await db.nfts.find({
        "creator_wallet": wallet,
        "is_listed": True,
        "price": {"$gt": 0}
    }).sort("price", 1).limit(1).to_list(1)
    floor_price = listed_nfts[0]["price"] if listed_nfts else None
    
    # Count unique buyers of creator's NFTs
    sales = await db.nft_sales.find({"nft_id": {"$in": creator_nfts}}).to_list(1000)
    unique_owners = len(set(sale["buyer_wallet"] for sale in sales))
    
    # Calculate average price
    pipeline = [
        {"$match": {"creator_wallet": wallet, "price": {"$gt": 0}}},
        {"$group": {"_id": None, "avg_price": {"$avg": "$price"}}}
    ]
    avg_result = await db.nfts.aggregate(pipeline).to_list(1)
    average_price = avg_result[0]["avg_price"] if avg_result else 0.0
    
    stats = NFTStats(
        total_nfts=total_nfts,
        total_volume=total_volume,
        total_sales=total_sales,
        floor_price=floor_price,
        unique_owners=unique_owners,
        average_price=average_price
    )
    
    return stats 