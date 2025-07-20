import httpx
import json
from typing import Dict, Any, List
import os
from datetime import datetime


class IrysService:
    """Service for interacting with Irys for permanent storage"""
    
    def __init__(self):
        self.devnet_url = "https://devnet.irys.xyz"
        self.gateway_url = "https://gateway.irys.xyz"
        self.graphql_url = f"{self.devnet_url}/graphql"
    
    async def query_articles_by_author(self, author_wallet: str, limit: int = 20) -> List[Dict]:
        """Query articles by author from Irys GraphQL"""
        query = """
        query GetArticlesByAuthor($tags: [TagFilter!]!, $limit: Int!) {
          transactions(
            tags: $tags,
            sort: HEIGHT_DESC,
            first: $limit
          ) {
            edges {
              node {
                id
                tags {
                  name
                  value
                }
                timestamp
              }
            }
          }
        }
        """
        
        variables = {
            "tags": [
                {"name": "App-Name", "values": ["Mirror-Clone"]},
                {"name": "Content-Type", "values": ["article"]},
                {"name": "Author", "values": [author_wallet]}
            ],
            "limit": limit
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.graphql_url,
                    json={"query": query, "variables": variables},
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                
                return data.get("data", {}).get("transactions", {}).get("edges", [])
            except Exception as e:
                print(f"Error querying Irys: {e}")
                return []
    
    async def query_recent_articles(self, limit: int = 20) -> List[Dict]:
        """Query recent articles from Irys GraphQL"""
        query = """
        query GetRecentArticles($tags: [TagFilter!]!, $limit: Int!) {
          transactions(
            tags: $tags,
            sort: HEIGHT_DESC,
            first: $limit
          ) {
            edges {
              node {
                id
                tags {
                  name
                  value
                }
                timestamp
              }
            }
          }
        }
        """
        
        variables = {
            "tags": [
                {"name": "App-Name", "values": ["Mirror-Clone"]},
                {"name": "Content-Type", "values": ["article"]}
            ],
            "limit": limit
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.graphql_url,
                    json={"query": query, "variables": variables},
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                
                return data.get("data", {}).get("transactions", {}).get("edges", [])
            except Exception as e:
                print(f"Error querying recent articles: {e}")
                return []
    
    async def get_article_content(self, irys_id: str) -> Dict[str, Any]:
        """Retrieve article content from Irys gateway"""
        url = f"{self.gateway_url}/{irys_id}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                
                # Try to parse as JSON, fallback to text
                try:
                    return response.json()
                except:
                    return {"content": response.text}
            except Exception as e:
                print(f"Error retrieving article content: {e}")
                return {}
    
    async def search_articles_by_tags(self, tags: List[str], limit: int = 20) -> List[Dict]:
        """Search articles by tags"""
        # Build tag filters for GraphQL query
        tag_filters = [
            {"name": "App-Name", "values": ["Mirror-Clone"]},
            {"name": "Content-Type", "values": ["article"]}
        ]
        
        # Add tag filters
        for tag in tags:
            tag_filters.append({"name": "Tag", "values": [tag]})
        
        query = """
        query SearchArticlesByTags($tags: [TagFilter!]!, $limit: Int!) {
          transactions(
            tags: $tags,
            sort: HEIGHT_DESC,
            first: $limit
          ) {
            edges {
              node {
                id
                tags {
                  name
                  value
                }
                timestamp
              }
            }
          }
        }
        """
        
        variables = {
            "tags": tag_filters,
            "limit": limit
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.graphql_url,
                    json={"query": query, "variables": variables},
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                
                return data.get("data", {}).get("transactions", {}).get("edges", [])
            except Exception as e:
                print(f"Error searching articles by tags: {e}")
                return []
    
    def get_gateway_url(self, irys_id: str) -> str:
        """Get the gateway URL for an Irys transaction"""
        return f"{self.gateway_url}/{irys_id}"
    
    def parse_irys_transaction(self, tx_data: Dict) -> Dict[str, Any]:
        """Parse Irys transaction data into readable format"""
        node = tx_data.get("node", {})
        tags = {tag["name"]: tag["value"] for tag in node.get("tags", [])}
        
        return {
            "irys_id": node.get("id"),
            "title": tags.get("Title", ""),
            "author": tags.get("Author", ""),
            "category": tags.get("Category", "General"),
            "timestamp": node.get("timestamp"),
            "tags": [tag["value"] for tag in node.get("tags", []) if tag["name"] == "Tag"],
            "gateway_url": self.get_gateway_url(node.get("id", ""))
        }


# Global instance
irys_service = IrysService()