from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class NFTMetadata(BaseModel):
    name: str = Field(..., max_length=100)
    description: str = Field(..., max_length=1000)
    image: str = Field(..., max_length=500)  # IPFS/Irys URL
    external_url: Optional[str] = Field(None, max_length=500)
    attributes: List[dict] = Field(default_factory=list)

class NFTBase(BaseModel):
    article_id: str = Field(..., min_length=1)
    token_id: Optional[str] = Field(None)
    contract_address: Optional[str] = Field(None, max_length=42)
    chain_id: int = Field(default=1)  # 1 for Ethereum mainnet, 137 for Polygon, etc.
    metadata: NFTMetadata
    creator_wallet: str = Field(..., min_length=42, max_length=42)
    supply: int = Field(default=1, ge=1, le=10000)
    price: Optional[float] = Field(None, ge=0)
    currency: str = Field(default="ETH", regex="^(ETH|MATIC|USDC)$")
    royalty_percentage: float = Field(default=10.0, ge=0, le=50)  # Percentage

class NFTCreate(NFTBase):
    pass

class NFTUpdate(BaseModel):
    price: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, regex="^(ETH|MATIC|USDC)$")
    is_listed: Optional[bool] = None

class NFT(NFTBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_listed: bool = Field(default=False)
    is_minted: bool = Field(default=False)
    mint_transaction_hash: Optional[str] = Field(None)
    total_sales: int = Field(default=0)
    total_volume: float = Field(default=0.0)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class NFTSaleBase(BaseModel):
    nft_id: str = Field(..., min_length=1)
    seller_wallet: str = Field(..., min_length=42, max_length=42)
    buyer_wallet: str = Field(..., min_length=42, max_length=42)
    price: float = Field(..., ge=0)
    currency: str = Field(default="ETH", regex="^(ETH|MATIC|USDC)$")
    royalty_amount: float = Field(default=0, ge=0)

class NFTSaleCreate(NFTSaleBase):
    pass

class NFTSale(NFTSaleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    transaction_hash: Optional[str] = Field(None)
    status: str = Field(default="pending", regex="^(pending|completed|failed)$")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class NFTCollectionBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: str = Field(..., max_length=1000)
    creator_wallet: str = Field(..., min_length=42, max_length=42)
    cover_image: Optional[str] = Field(None, max_length=500)
    category: str = Field(default="General", max_length=50)

class NFTCollectionCreate(NFTCollectionBase):
    pass

class NFTCollection(NFTCollectionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    total_items: int = Field(default=0)
    total_volume: float = Field(default=0.0)
    floor_price: Optional[float] = Field(None, ge=0)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class NFTStats(BaseModel):
    total_nfts: int = Field(default=0)
    total_volume: float = Field(default=0.0)
    total_sales: int = Field(default=0)
    floor_price: Optional[float] = Field(None, ge=0)
    unique_owners: int = Field(default=0)
    average_price: float = Field(default=0.0)
    
    class Config:
        json_encoders = {
            float: lambda v: round(v, 4)
        } 