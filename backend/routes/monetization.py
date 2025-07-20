from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timedelta
from decimal import Decimal

from models.monetization import (
    Tip, TipCreate, PaidContent, PaidContentCreate, PaidContentUpdate,
    Purchase, PurchaseCreate, Subscription, SubscriptionCreate, RevenueStats
)
from database import db

router = APIRouter(prefix="/api/monetization", tags=["monetization"])

# Tips API
@router.post("/tips", response_model=Tip)
async def create_tip(tip_data: TipCreate):
    """Create a new tip"""
    
    tip = Tip(**tip_data.dict())
    
    # Insert into MongoDB
    result = await db.tips.insert_one(tip.dict())
    
    if result.inserted_id:
        # Update author stats
        await db.authors.update_one(
            {"wallet": tip.to_wallet},
            {"$inc": {"total_tips_received": float(tip.amount)}}
        )
        
        return tip
    else:
        raise HTTPException(status_code=500, detail="Failed to create tip")

@router.get("/tips/received/{wallet}", response_model=List[Tip])
async def get_tips_received(wallet: str, limit: int = 20, offset: int = 0):
    """Get tips received by a wallet"""
    
    cursor = db.tips.find({"to_wallet": wallet}).sort("created_at", -1).skip(offset).limit(limit)
    tips = await cursor.to_list(length=limit)
    
    return [Tip(**tip) for tip in tips]

@router.get("/tips/sent/{wallet}", response_model=List[Tip])
async def get_tips_sent(wallet: str, limit: int = 20, offset: int = 0):
    """Get tips sent by a wallet"""
    
    cursor = db.tips.find({"from_wallet": wallet}).sort("created_at", -1).skip(offset).limit(limit)
    tips = await cursor.to_list(length=limit)
    
    return [Tip(**tip) for tip in tips]

# Paid Content API
@router.post("/paid-content", response_model=PaidContent)
async def create_paid_content(paid_content_data: PaidContentCreate):
    """Create paid content for an article"""
    
    # Check if article exists
    article = await db.articles.find_one({"id": paid_content_data.article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if paid content already exists
    existing = await db.paid_content.find_one({"article_id": paid_content_data.article_id})
    if existing:
        raise HTTPException(status_code=400, detail="Paid content already exists for this article")
    
    paid_content = PaidContent(**paid_content_data.dict())
    
    result = await db.paid_content.insert_one(paid_content.dict())
    
    if result.inserted_id:
        return paid_content
    else:
        raise HTTPException(status_code=500, detail="Failed to create paid content")

@router.get("/paid-content/{article_id}", response_model=PaidContent)
async def get_paid_content(article_id: str):
    """Get paid content for an article"""
    
    paid_content = await db.paid_content.find_one({"article_id": article_id, "is_active": True})
    
    if not paid_content:
        raise HTTPException(status_code=404, detail="Paid content not found")
    
    return PaidContent(**paid_content)

@router.put("/paid-content/{article_id}", response_model=PaidContent)
async def update_paid_content(article_id: str, update_data: PaidContentUpdate):
    """Update paid content"""
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.paid_content.update_one(
        {"article_id": article_id},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Paid content not found")
    
    # Fetch and return updated paid content
    updated_content = await db.paid_content.find_one({"article_id": article_id})
    if updated_content:
        return PaidContent(**updated_content)
    else:
        raise HTTPException(status_code=404, detail="Paid content not found")

@router.delete("/paid-content/{article_id}")
async def deactivate_paid_content(article_id: str):
    """Deactivate paid content"""
    
    result = await db.paid_content.update_one(
        {"article_id": article_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Paid content not found")
    
    return {"message": "Paid content deactivated successfully"}

# Purchase API
@router.post("/purchases", response_model=Purchase)
async def create_purchase(purchase_data: PurchaseCreate):
    """Create a purchase record"""
    
    purchase = Purchase(**purchase_data.dict())
    
    result = await db.purchases.insert_one(purchase.dict())
    
    if result.inserted_id:
        # Update paid content stats
        await db.paid_content.update_one(
            {"article_id": purchase.article_id},
            {"$inc": {
                "total_purchases": 1,
                "total_revenue": float(purchase.amount)
            }}
        )
        
        return purchase
    else:
        raise HTTPException(status_code=500, detail="Failed to create purchase")

@router.get("/purchases/{buyer_wallet}", response_model=List[Purchase])
async def get_user_purchases(buyer_wallet: str, limit: int = 20, offset: int = 0):
    """Get purchases by a user"""
    
    cursor = db.purchases.find({"buyer_wallet": buyer_wallet}).sort("created_at", -1).skip(offset).limit(limit)
    purchases = await cursor.to_list(length=limit)
    
    return [Purchase(**purchase) for purchase in purchases]

@router.get("/purchases/article/{article_id}", response_model=List[Purchase])
async def get_article_purchases(article_id: str, limit: int = 20, offset: int = 0):
    """Get purchases for an article"""
    
    cursor = db.purchases.find({"article_id": article_id}).sort("created_at", -1).skip(offset).limit(limit)
    purchases = await cursor.to_list(length=limit)
    
    return [Purchase(**purchase) for purchase in purchases]

# Subscription API
@router.post("/subscriptions", response_model=Subscription)
async def create_subscription(subscription_data: SubscriptionCreate):
    """Create a subscription"""
    
    # Check if subscription already exists
    existing = await db.subscriptions.find_one({
        "subscriber_wallet": subscription_data.subscriber_wallet,
        "author_wallet": subscription_data.author_wallet,
        "is_active": True
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Active subscription already exists")
    
    # Calculate next billing date
    if subscription_data.interval == "monthly":
        next_billing = datetime.utcnow() + timedelta(days=30)
    else:  # yearly
        next_billing = datetime.utcnow() + timedelta(days=365)
    
    subscription = Subscription(
        **subscription_data.dict(),
        next_billing=next_billing
    )
    
    result = await db.subscriptions.insert_one(subscription.dict())
    
    if result.inserted_id:
        # Update author stats
        await db.authors.update_one(
            {"wallet": subscription.author_wallet},
            {"$inc": {"active_subscribers": 1}}
        )
        
        return subscription
    else:
        raise HTTPException(status_code=500, detail="Failed to create subscription")

@router.get("/subscriptions/subscriber/{wallet}", response_model=List[Subscription])
async def get_user_subscriptions(wallet: str):
    """Get subscriptions by a user"""
    
    cursor = db.subscriptions.find({"subscriber_wallet": wallet, "is_active": True})
    subscriptions = await cursor.to_list(length=100)
    
    return [Subscription(**sub) for sub in subscriptions]

@router.get("/subscriptions/author/{wallet}", response_model=List[Subscription])
async def get_author_subscribers(wallet: str, limit: int = 20, offset: int = 0):
    """Get subscribers for an author"""
    
    cursor = db.subscriptions.find({"author_wallet": wallet, "is_active": True}).skip(offset).limit(limit)
    subscriptions = await cursor.to_list(length=limit)
    
    return [Subscription(**sub) for sub in subscriptions]

@router.delete("/subscriptions/{subscription_id}")
async def cancel_subscription(subscription_id: str):
    """Cancel a subscription"""
    
    result = await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": {"is_active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Update author stats
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if subscription:
        await db.authors.update_one(
            {"wallet": subscription["author_wallet"]},
            {"$inc": {"active_subscribers": -1}}
        )
    
    return {"message": "Subscription cancelled successfully"}

# Revenue Stats API
@router.get("/revenue/{wallet}", response_model=RevenueStats)
async def get_revenue_stats(wallet: str):
    """Get revenue statistics for a wallet"""
    
    # Calculate tips received
    tips_cursor = db.tips.find({"to_wallet": wallet})
    tips = await tips_cursor.to_list(length=1000)
    total_tips = sum(Decimal(tip["amount"]) for tip in tips)
    
    # Calculate paid content revenue
    paid_content_cursor = db.paid_content.find({"article_id": {"$in": [tip["article_id"] for tip in tips if tip.get("article_id")]}})
    paid_content = await paid_content_cursor.to_list(length=1000)
    total_paid_content = sum(Decimal(pc["total_revenue"]) for pc in paid_content)
    
    # Calculate subscription revenue
    subscriptions_cursor = db.subscriptions.find({"author_wallet": wallet, "is_active": True})
    subscriptions = await subscriptions_cursor.to_list(length=1000)
    total_subscription = sum(Decimal(sub["total_paid"]) for sub in subscriptions)
    
    # Calculate purchases made
    purchases_cursor = db.purchases.find({"buyer_wallet": wallet})
    purchases = await purchases_cursor.to_list(length=1000)
    
    stats = RevenueStats(
        total_tips_received=total_tips,
        total_paid_content_revenue=total_paid_content,
        total_subscription_revenue=total_subscription,
        total_revenue=total_tips + total_paid_content + total_subscription,
        tips_count=len(tips),
        purchases_count=len(purchases),
        active_subscribers=len(subscriptions)
    )
    
    return stats 