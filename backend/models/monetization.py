from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
from decimal import Decimal

class TipBase(BaseModel):
    from_wallet: str = Field(..., min_length=42, max_length=42)
    to_wallet: str = Field(..., min_length=42, max_length=42)
    article_id: Optional[str] = Field(None)
    amount: Decimal = Field(..., ge=Decimal('0.0001'))
    currency: str = Field(default="ETH", regex="^(ETH|MATIC|USDC)$")
    message: Optional[str] = Field(None, max_length=500)

class TipCreate(TipBase):
    pass

class Tip(TipBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    transaction_hash: Optional[str] = Field(None)
    status: str = Field(default="pending", regex="^(pending|completed|failed)$")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: str(v)
        }

class PaidContentBase(BaseModel):
    article_id: str = Field(..., min_length=1)
    price: Decimal = Field(..., ge=Decimal('0.0001'))
    currency: str = Field(default="ETH", regex="^(ETH|MATIC|USDC)$")
    description: Optional[str] = Field(None, max_length=500)
    preview_length: int = Field(default=500, ge=100, le=2000)  # Characters to show for free

class PaidContentCreate(PaidContentBase):
    pass

class PaidContentUpdate(BaseModel):
    price: Optional[Decimal] = Field(None, ge=Decimal('0.0001'))
    currency: Optional[str] = Field(None, regex="^(ETH|MATIC|USDC)$")
    description: Optional[str] = Field(None, max_length=500)
    preview_length: Optional[int] = Field(None, ge=100, le=2000)

class PaidContent(PaidContentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    total_purchases: int = Field(default=0)
    total_revenue: Decimal = Field(default=Decimal('0'))
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: str(v)
        }

class PurchaseBase(BaseModel):
    buyer_wallet: str = Field(..., min_length=42, max_length=42)
    article_id: str = Field(..., min_length=1)
    amount: Decimal = Field(..., ge=Decimal('0.0001'))
    currency: str = Field(default="ETH", regex="^(ETH|MATIC|USDC)$")

class PurchaseCreate(PurchaseBase):
    pass

class Purchase(PurchaseBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    transaction_hash: Optional[str] = Field(None)
    status: str = Field(default="pending", regex="^(pending|completed|failed)$")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: str(v)
        }

class SubscriptionBase(BaseModel):
    subscriber_wallet: str = Field(..., min_length=42, max_length=42)
    author_wallet: str = Field(..., min_length=42, max_length=42)
    amount: Decimal = Field(..., ge=Decimal('0.0001'))
    currency: str = Field(default="ETH", regex="^(ETH|MATIC|USDC)$")
    interval: str = Field(..., regex="^(monthly|yearly)$")

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    next_billing: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    total_paid: Decimal = Field(default=Decimal('0'))
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: str(v)
        }

class RevenueStats(BaseModel):
    total_tips_received: Decimal = Field(default=Decimal('0'))
    total_paid_content_revenue: Decimal = Field(default=Decimal('0'))
    total_subscription_revenue: Decimal = Field(default=Decimal('0'))
    total_revenue: Decimal = Field(default=Decimal('0'))
    tips_count: int = Field(default=0)
    purchases_count: int = Field(default=0)
    active_subscribers: int = Field(default=0)
    
    class Config:
        json_encoders = {
            Decimal: lambda v: str(v)
        } 