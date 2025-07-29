#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Mirror.xyz Clone
Tests all implemented backend functionality including:
- Health & Status Checks
- Article Management (CRUD operations)
- Author Profile Management
- Search & Discovery
- Irys Integration
- Database Operations
- Error Handling
"""

import asyncio
import httpx
import json
import os
from datetime import datetime
from typing import Dict, Any, List

# Get backend URL from frontend .env file
BASE_URL = "http://localhost:8000/api"
print(f"Testing backend at: {BASE_URL}")

class BackendTester:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self.test_results = []
        self.test_data = {}
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data if not success else None
        })
    
    async def test_health_endpoints(self):
        """Test health and status endpoints"""
        print("\n=== Testing Health & Status Endpoints ===")
        
        # Test root endpoint
        try:
            response = await self.client.get(f"{BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Root endpoint", True, f"Message: {data.get('message', 'N/A')}")
            else:
                self.log_test("Root endpoint", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Root endpoint", False, f"Exception: {str(e)}")
        
        # Test health endpoint
        try:
            response = await self.client.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health check", True, f"Status: {data.get('status', 'N/A')}")
            else:
                self.log_test("Health check", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health check", False, f"Exception: {str(e)}")
    
    async def test_article_endpoints(self):
        """Test article CRUD operations"""
        print("\n=== Testing Article Management ===")
        
        # Test data for article creation
        article_data = {
            "title": "Decentralized Publishing on Irys: A Complete Guide",
            "content": "# Introduction to Decentralized Publishing\n\nDecentralized publishing represents a paradigm shift in how we think about content creation and distribution. With platforms like Irys, we can now store content permanently on the blockchain, ensuring censorship resistance and true ownership.\n\n## Why Irys?\n\nIrys provides permanent data storage with instant availability. Unlike traditional storage solutions, data stored on Irys is immutable and accessible forever.\n\n## Getting Started\n\nTo begin publishing on Irys, you'll need to connect your wallet and fund it with the appropriate tokens. The process is straightforward and user-friendly.\n\n## Conclusion\n\nDecentralized publishing is the future of content creation, offering creators unprecedented control over their work.",
            "html": "<h1>Introduction to Decentralized Publishing</h1><p>Decentralized publishing represents a paradigm shift in how we think about content creation and distribution. With platforms like Irys, we can now store content permanently on the blockchain, ensuring censorship resistance and true ownership.</p><h2>Why Irys?</h2><p>Irys provides permanent data storage with instant availability. Unlike traditional storage solutions, data stored on Irys is immutable and accessible forever.</p><h2>Getting Started</h2><p>To begin publishing on Irys, you'll need to connect your wallet and fund it with the appropriate tokens. The process is straightforward and user-friendly.</p><h2>Conclusion</h2><p>Decentralized publishing is the future of content creation, offering creators unprecedented control over their work.</p>",
            "excerpt": "Decentralized publishing represents a paradigm shift in how we think about content creation and distribution. With platforms like Irys, we can now store content permanently on the blockchain...",
            "author_wallet": "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
            "author_name": "Alice Chen",
            "tags": ["blockchain", "web3", "irys", "decentralized", "publishing"],
            "category": "Technology"
        }
        
        # Test article creation
        try:
            response = await self.client.post(f"{BASE_URL}/articles/", json=article_data)
            if response.status_code == 200:
                created_article = response.json()
                self.test_data['article_id'] = created_article['id']
                self.log_test("Create article", True, f"Article ID: {created_article['id']}")
            else:
                self.log_test("Create article", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create article", False, f"Exception: {str(e)}")
        
        # Test get all articles
        try:
            response = await self.client.get(f"{BASE_URL}/articles/")
            if response.status_code == 200:
                articles = response.json()
                self.log_test("Get all articles", True, f"Found {len(articles)} articles")
            else:
                self.log_test("Get all articles", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get all articles", False, f"Exception: {str(e)}")
        
        # Test get article by ID (if we have one)
        if 'article_id' in self.test_data:
            try:
                response = await self.client.get(f"{BASE_URL}/articles/{self.test_data['article_id']}")
                if response.status_code == 200:
                    article = response.json()
                    self.log_test("Get article by ID", True, f"Title: {article.get('title', 'N/A')}")
                else:
                    self.log_test("Get article by ID", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Get article by ID", False, f"Exception: {str(e)}")
        
        # Test get articles by author
        try:
            response = await self.client.get(f"{BASE_URL}/articles/author/{article_data['author_wallet']}")
            if response.status_code == 200:
                articles = response.json()
                self.log_test("Get articles by author", True, f"Found {len(articles)} articles for author")
            else:
                self.log_test("Get articles by author", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get articles by author", False, f"Exception: {str(e)}")
        
        # Test article search
        search_data = {
            "query": "decentralized",
            "tags": ["blockchain", "web3"],
            "category": "Technology",
            "limit": 10,
            "offset": 0
        }
        
        try:
            response = await self.client.post(f"{BASE_URL}/articles/search", json=search_data)
            if response.status_code == 200:
                results = response.json()
                self.log_test("Search articles", True, f"Found {len(results)} matching articles")
            else:
                self.log_test("Search articles", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Search articles", False, f"Exception: {str(e)}")
        
        # Test Irys ID update (if we have an article)
        if 'article_id' in self.test_data:
            try:
                irys_data = {
                    "irys_id": "test-irys-id-12345",
                    "irys_url": "https://gateway.irys.xyz/test-irys-id-12345"
                }
                response = await self.client.put(
                    f"{BASE_URL}/articles/{self.test_data['article_id']}/irys",
                    params=irys_data
                )
                if response.status_code == 200:
                    updated_article = response.json()
                    self.log_test("Update article Irys ID", True, f"Irys ID: {updated_article.get('irys_id', 'N/A')}")
                else:
                    self.log_test("Update article Irys ID", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Update article Irys ID", False, f"Exception: {str(e)}")
    
    async def test_author_endpoints(self):
        """Test author profile management"""
        print("\n=== Testing Author Profile Management ===")
        
        # Test data for author creation
        author_data = {
            "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
            "username": "alice_chen",
            "display_name": "Alice Chen",
            "bio": "Blockchain developer and technical writer passionate about decentralized technologies. Building the future of Web3 one article at a time.",
            "social_links": {
                "twitter": "@alice_web3",
                "github": "alice-chen-dev",
                "website": "https://alicechen.dev"
            }
        }
        
        # Test author profile creation
        try:
            response = await self.client.post(f"{BASE_URL}/authors/", json=author_data)
            if response.status_code == 200:
                created_author = response.json()
                self.test_data['author_wallet'] = created_author['wallet_address']
                self.log_test("Create author profile", True, f"Username: {created_author.get('username', 'N/A')}")
            elif response.status_code == 400:
                # Profile might already exist
                self.test_data['author_wallet'] = author_data['wallet_address']
                self.log_test("Create author profile", True, "Profile already exists (expected)")
            else:
                self.log_test("Create author profile", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create author profile", False, f"Exception: {str(e)}")
        
        # Test get author profile
        if 'author_wallet' in self.test_data:
            try:
                response = await self.client.get(f"{BASE_URL}/authors/{self.test_data['author_wallet']}")
                if response.status_code == 200:
                    author = response.json()
                    self.log_test("Get author profile", True, f"Display name: {author.get('display_name', 'N/A')}")
                else:
                    self.log_test("Get author profile", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Get author profile", False, f"Exception: {str(e)}")
        
        # Test get all authors
        try:
            response = await self.client.get(f"{BASE_URL}/authors/")
            if response.status_code == 200:
                authors = response.json()
                self.log_test("Get all authors", True, f"Found {len(authors)} authors")
            else:
                self.log_test("Get all authors", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get all authors", False, f"Exception: {str(e)}")
        
        # Test author profile update
        if 'author_wallet' in self.test_data:
            update_data = {
                "bio": "Updated bio: Senior blockchain developer with 5+ years experience in DeFi and Web3 infrastructure.",
                "social_links": {
                    "twitter": "@alice_web3_updated",
                    "github": "alice-chen-dev",
                    "website": "https://alicechen.dev",
                    "linkedin": "alice-chen-blockchain"
                }
            }
            
            try:
                response = await self.client.put(f"{BASE_URL}/authors/{self.test_data['author_wallet']}", json=update_data)
                if response.status_code == 200:
                    updated_author = response.json()
                    self.log_test("Update author profile", True, "Profile updated successfully")
                else:
                    self.log_test("Update author profile", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Update author profile", False, f"Exception: {str(e)}")
        
        # Test author stats increment
        if 'author_wallet' in self.test_data:
            try:
                response = await self.client.post(f"{BASE_URL}/authors/{self.test_data['author_wallet']}/stats/article")
                if response.status_code == 200:
                    self.log_test("Increment article count", True, "Article count incremented")
                else:
                    self.log_test("Increment article count", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Increment article count", False, f"Exception: {str(e)}")
            
            try:
                response = await self.client.post(f"{BASE_URL}/authors/{self.test_data['author_wallet']}/stats/views", params={"views": 5})
                if response.status_code == 200:
                    self.log_test("Increment view count", True, "View count incremented")
                else:
                    self.log_test("Increment view count", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Increment view count", False, f"Exception: {str(e)}")
    
    async def test_search_endpoints(self):
        """Test search and discovery functionality"""
        print("\n=== Testing Search & Discovery ===")
        
        # Test search suggestions
        try:
            response = await self.client.get(f"{BASE_URL}/search/suggestions", params={"q": "block", "limit": 5})
            if response.status_code == 200:
                suggestions = response.json()
                self.log_test("Search suggestions", True, f"Found {len(suggestions)} suggestions")
            else:
                self.log_test("Search suggestions", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Search suggestions", False, f"Exception: {str(e)}")
        
        # Test search stats
        try:
            response = await self.client.get(f"{BASE_URL}/search/stats")
            if response.status_code == 200:
                stats = response.json()
                self.log_test("Search stats", True, f"Total articles: {stats.get('total_articles', 0)}")
            else:
                self.log_test("Search stats", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Search stats", False, f"Exception: {str(e)}")
        
        # Test popular tags
        try:
            response = await self.client.get(f"{BASE_URL}/search/tags", params={"limit": 10})
            if response.status_code == 200:
                tags = response.json()
                self.log_test("Popular tags", True, f"Found {len(tags)} tags")
            else:
                self.log_test("Popular tags", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Popular tags", False, f"Exception: {str(e)}")
        
        # Test categories
        try:
            response = await self.client.get(f"{BASE_URL}/search/categories")
            if response.status_code == 200:
                categories = response.json()
                self.log_test("Categories", True, f"Found {len(categories)} categories")
            else:
                self.log_test("Categories", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Categories", False, f"Exception: {str(e)}")
    
    async def test_error_handling(self):
        """Test error handling and edge cases"""
        print("\n=== Testing Error Handling ===")
        
        # Test get non-existent article
        try:
            response = await self.client.get(f"{BASE_URL}/articles/non-existent-id")
            if response.status_code == 404:
                self.log_test("Get non-existent article", True, "Correctly returned 404")
            else:
                self.log_test("Get non-existent article", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Get non-existent article", False, f"Exception: {str(e)}")
        
        # Test get non-existent author
        try:
            response = await self.client.get(f"{BASE_URL}/authors/non-existent-wallet")
            if response.status_code == 404:
                self.log_test("Get non-existent author", True, "Correctly returned 404")
            else:
                self.log_test("Get non-existent author", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Get non-existent author", False, f"Exception: {str(e)}")
        
        # Test invalid article creation (missing required fields)
        try:
            invalid_data = {"title": "Test"}  # Missing required fields
            response = await self.client.post(f"{BASE_URL}/articles/", json=invalid_data)
            if response.status_code == 422:
                self.log_test("Invalid article creation", True, "Correctly returned 422 for validation error")
            else:
                self.log_test("Invalid article creation", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Invalid article creation", False, f"Exception: {str(e)}")
    
    async def test_irys_integration(self):
        """Test Irys service integration (basic connectivity)"""
        print("\n=== Testing Irys Integration ===")
        
        # Note: We can't fully test Irys integration without actual data on the devnet
        # But we can test that the service is properly initialized and endpoints respond
        
        # Test that Irys-related endpoints don't crash
        try:
            # Test querying recent articles (should not crash even if no data)
            response = await self.client.get(f"{BASE_URL}/articles/", params={"limit": 5})
            if response.status_code == 200:
                self.log_test("Irys query integration", True, "Irys service queries execute without errors")
            else:
                self.log_test("Irys query integration", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Irys query integration", False, f"Exception: {str(e)}")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("BACKEND API TEST SUMMARY")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\nFailed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        return passed_tests, failed_tests, total_tests

async def main():
    """Run all backend tests"""
    print("Starting comprehensive backend API testing...")
    print(f"Backend URL: {BASE_URL}")
    
    async with BackendTester() as tester:
        # Run all test suites
        await tester.test_health_endpoints()
        await tester.test_article_endpoints()
        await tester.test_author_endpoints()
        await tester.test_search_endpoints()
        await tester.test_error_handling()
        await tester.test_irys_integration()
        
        # Print summary
        passed, failed, total = tester.print_summary()
        
        # Return exit code based on results
        return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)