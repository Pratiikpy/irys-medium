import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

class ApiService {
  constructor() {
    this.axios = axios.create({
      baseURL: API,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Articles API
  async createArticle(articleData) {
    try {
      const response = await this.axios.post('/articles/', articleData);
      return response.data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw new Error('Failed to create article');
    }
  }

  async updateArticleIrysId(articleId, irysId, irysUrl) {
    try {
      const response = await this.axios.put(`/articles/${articleId}/irys`, null, {
        params: { irys_id: irysId, irys_url: irysUrl }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating article Irys ID:', error);
      throw new Error('Failed to update article');
    }
  }

  async getArticles(limit = 20, offset = 0) {
    try {
      const response = await this.axios.get('/articles/', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  async getArticle(articleId) {
    try {
      const response = await this.axios.get(`/articles/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw new Error('Article not found');
    }
  }

  async getArticlesByAuthor(authorWallet, limit = 20, offset = 0) {
    try {
      const response = await this.axios.get(`/articles/author/${authorWallet}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching articles by author:', error);
      return [];
    }
  }

  async searchArticles(searchQuery) {
    try {
      const response = await this.axios.post('/articles/search', searchQuery);
      return response.data;
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  }

  // Authors API
  async createAuthorProfile(profileData) {
    try {
      const response = await this.axios.post('/authors/', profileData);
      return response.data;
    } catch (error) {
      console.error('Error creating author profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  async getAuthorProfile(walletAddress) {
    try {
      const response = await this.axios.get(`/authors/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching author profile:', error);
      return null;
    }
  }

  async updateAuthorProfile(walletAddress, profileUpdate) {
    try {
      const response = await this.axios.put(`/authors/${walletAddress}`, profileUpdate);
      return response.data;
    } catch (error) {
      console.error('Error updating author profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async getAllAuthors(limit = 20, offset = 0) {
    try {
      const response = await this.axios.get('/authors/', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  }

  async incrementArticleCount(walletAddress) {
    try {
      const response = await this.axios.post(`/authors/${walletAddress}/stats/article`);
      return response.data;
    } catch (error) {
      console.error('Error incrementing article count:', error);
    }
  }

  // Search API
  async getSearchSuggestions(query, limit = 5) {
    try {
      const response = await this.axios.get('/search/suggestions', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  }

  async getSearchStats() {
    try {
      const response = await this.axios.get('/search/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching search stats:', error);
      return null;
    }
  }

  async getPopularTags(limit = 20) {
    try {
      const response = await this.axios.get('/search/tags', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  }

  async getCategories() {
    try {
      const response = await this.axios.get('/search/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Comments API
  async getArticleComments(articleId, limit = 50, offset = 0) {
    try {
      const response = await this.axios.get(`/comments/article/${articleId}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async createComment(commentData) {
    try {
      const response = await this.axios.post('/comments', commentData);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  async addCommentReaction(commentId, reactionData) {
    try {
      const response = await this.axios.post(`/comments/${commentId}/reactions`, reactionData);
      return response.data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  // Monetization API
  async createTip(tipData) {
    try {
      const response = await this.axios.post('/monetization/tips', tipData);
      return response.data;
    } catch (error) {
      console.error('Error creating tip:', error);
      throw new Error('Failed to create tip');
    }
  }

  async getTipsReceived(wallet, limit = 20, offset = 0) {
    try {
      const response = await this.axios.get(`/monetization/tips/received/${wallet}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tips received:', error);
      return [];
    }
  }

  async getTipsSent(wallet, limit = 20, offset = 0) {
    try {
      const response = await this.axios.get(`/monetization/tips/sent/${wallet}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tips sent:', error);
      return [];
    }
  }

  async createPaidContent(paidContentData) {
    try {
      const response = await this.axios.post('/monetization/paid-content', paidContentData);
      return response.data;
    } catch (error) {
      console.error('Error creating paid content:', error);
      throw new Error('Failed to create paid content');
    }
  }

  async getPaidContent(articleId) {
    try {
      const response = await this.axios.get(`/monetization/paid-content/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching paid content:', error);
      return null;
    }
  }

  async createPurchase(purchaseData) {
    try {
      const response = await this.axios.post('/monetization/purchases', purchaseData);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw new Error('Failed to create purchase');
    }
  }

  async getUserPurchases(wallet, limit = 20, offset = 0) {
    try {
      const response = await this.axios.get(`/monetization/purchases/${wallet}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      return [];
    }
  }

  async createSubscription(subscriptionData) {
    try {
      const response = await this.axios.post('/monetization/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async getUserSubscriptions(wallet) {
    try {
      const response = await this.axios.get(`/monetization/subscriptions/subscriber/${wallet}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
  }

  async getAuthorSubscribers(wallet, limit = 20, offset = 0) {
    try {
      const response = await this.axios.get(`/monetization/subscriptions/author/${wallet}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching author subscribers:', error);
      return [];
    }
  }

  async getRevenueStats(wallet) {
    try {
      const response = await this.axios.get(`/monetization/revenue/${wallet}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      return null;
    }
  }

  // NFT API
  async createNFT(nftData) {
    try {
      const response = await this.axios.post('/nft', nftData);
      return response.data;
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw new Error('Failed to create NFT');
    }
  }

  async getNFT(nftId) {
    try {
      const response = await this.axios.get(`/nft/${nftId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NFT:', error);
      return null;
    }
  }

  async getNFTByArticle(articleId) {
    try {
      const response = await this.axios.get(`/nft/article/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NFT by article:', error);
      return null;
    }
  }

  async listNFT(nftId, price, currency = 'ETH') {
    try {
      const response = await this.axios.post(`/nft/marketplace/list/${nftId}`, null, {
        params: { price, currency }
      });
      return response.data;
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw new Error('Failed to list NFT');
    }
  }

  async getListedNFTs(limit = 20, offset = 0, minPrice = 0, maxPrice = null) {
    try {
      const params = { limit, offset, min_price: minPrice };
      if (maxPrice) params.max_price = maxPrice;
      const response = await this.axios.get('/nft/marketplace/listed', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching listed NFTs:', error);
      return [];
    }
  }

  async createNFTSale(saleData) {
    try {
      const response = await this.axios.post('/nft/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating NFT sale:', error);
      throw new Error('Failed to create NFT sale');
    }
  }

  async getNFTStats(creatorWallet = null) {
    try {
      const endpoint = creatorWallet ? `/nft/stats/creator/${creatorWallet}` : '/nft/stats/global';
      const response = await this.axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching NFT stats:', error);
      return null;
    }
  }

  // Analytics API
  async trackPageView(pageviewData) {
    try {
      const response = await this.axios.post('/analytics/pageviews', pageviewData);
      return response.data;
    } catch (error) {
      console.error('Error tracking pageview:', error);
    }
  }

  async trackEngagement(engagementData) {
    try {
      const response = await this.axios.post('/analytics/engagement', engagementData);
      return response.data;
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  async getArticleStats(articleId) {
    try {
      const response = await this.axios.get(`/analytics/stats/article/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article stats:', error);
      return null;
    }
  }

  async getAuthorStats(wallet) {
    try {
      const response = await this.axios.get(`/analytics/stats/author/${wallet}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching author stats:', error);
      return null;
    }
  }

  async getTrendingArticles(limit = 10) {
    try {
      const response = await this.axios.get(`/analytics/stats/articles/trending?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  }

  async getPlatformStats() {
    try {
      const response = await this.axios.get('/analytics/stats/platform');
      return response.data;
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return null;
    }
  }

  async trackSearchQuery(searchData) {
    try {
      const response = await this.axios.post('/analytics/search', searchData);
      return response.data;
    } catch (error) {
      console.error('Error tracking search query:', error);
    }
  }

  async getPopularSearches(limit = 10, days = 7) {
    try {
      const response = await this.axios.get(`/analytics/search/popular?limit=${limit}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.axios.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error' };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;