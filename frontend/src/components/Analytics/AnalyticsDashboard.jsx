import React, { useState, useEffect } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const AnalyticsDashboard = () => {
  const { isConnected, walletAddress } = useWallet();
  const [platformStats, setPlatformStats] = useState(null);
  const [authorStats, setAuthorStats] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('platform');

  useEffect(() => {
    fetchAnalyticsData();
  }, [walletAddress]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [platform, trending, searches] = await Promise.all([
        apiService.getPlatformStats(),
        apiService.getTrendingArticles(10),
        apiService.getPopularSearches(10, 7)
      ]);

      setPlatformStats(platform);
      setTrendingArticles(trending);
      setPopularSearches(searches);

      // Fetch author-specific stats if connected
      if (isConnected && walletAddress) {
        try {
          const authorData = await apiService.getAuthorStats(walletAddress);
          setAuthorStats(authorData);
        } catch (error) {
          console.error('Error fetching author stats:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80 bg-gray-800 rounded-lg"></div>
              <div className="h-80 bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Analytics Dashboard</h1>
          <p className="text-gray-400">
            Track platform performance and discover trending content.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8">
          <button
            onClick={() => setActiveTab('platform')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'platform'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Platform Analytics
          </button>
          {isConnected && (
            <button
              onClick={() => setActiveTab('author')}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'author'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Your Analytics
            </button>
          )}
        </div>

        {/* Platform Analytics */}
        {activeTab === 'platform' && (
          <div className="space-y-8">
            {/* Platform Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Articles</p>
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(platformStats?.total_articles)}
                    </p>
                  </div>
                  <div className="text-blue-400 text-2xl">📄</div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Authors</p>
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(platformStats?.total_authors)}
                    </p>
                  </div>
                  <div className="text-green-400 text-2xl">👥</div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Views</p>
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(platformStats?.total_views)}
                    </p>
                  </div>
                  <div className="text-yellow-400 text-2xl">👁️</div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Articles Today</p>
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(platformStats?.articles_today)}
                    </p>
                  </div>
                  <div className="text-purple-400 text-2xl">🆕</div>
                </div>
              </div>
            </div>

            {/* Trending Articles and Popular Searches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Trending Articles */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  🔥 Trending Articles
                </h3>
                
                {trendingArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No trending articles yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trendingArticles.map((article, index) => (
                      <div key={article.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium line-clamp-2">
                            {article.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                            <span>👁️ {formatNumber(article.views)}</span>
                            <span>📅 {formatDate(article.published_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Searches */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  🔍 Popular Searches (7 days)
                </h3>
                
                {popularSearches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No search data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {popularSearches.map((search, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-gray-300 text-xs font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-gray-300">
                            {search.query || search.term}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {search.count || search.searches} searches
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Author Analytics */}
        {activeTab === 'author' && isConnected && (
          <div className="space-y-8">
            {authorStats ? (
              <>
                {/* Author Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Your Articles</p>
                        <p className="text-white text-2xl font-bold">
                          {authorStats.total_articles || 0}
                        </p>
                      </div>
                      <div className="text-blue-400 text-2xl">📝</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Views</p>
                        <p className="text-white text-2xl font-bold">
                          {formatNumber(authorStats.total_views)}
                        </p>
                      </div>
                      <div className="text-green-400 text-2xl">👁️</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Avg. Views</p>
                        <p className="text-white text-2xl font-bold">
                          {Math.round(authorStats.avg_views_per_article) || 0}
                        </p>
                      </div>
                      <div className="text-yellow-400 text-2xl">📊</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">This Month</p>
                        <p className="text-white text-2xl font-bold">
                          {authorStats.articles_this_month || 0}
                        </p>
                      </div>
                      <div className="text-purple-400 text-2xl">📅</div>
                    </div>
                  </div>
                </div>

                {/* Author Performance */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    📈 Your Performance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-gray-300 font-medium mb-4">Engagement Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Comments</span>
                          <span className="text-white">{authorStats.total_comments || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tips Received</span>
                          <span className="text-green-400">{authorStats.tips_received || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Article Shares</span>
                          <span className="text-white">{authorStats.total_shares || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-gray-300 font-medium mb-4">Content Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg. Reading Time</span>
                          <span className="text-white">
                            {Math.round(authorStats.avg_reading_time) || 0} min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Word Count</span>
                          <span className="text-white">
                            {formatNumber(authorStats.total_word_count)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Most Used Tag</span>
                          <span className="text-indigo-400">
                            {authorStats.most_used_tag || 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Analytics Available</h3>
                <p className="text-gray-400 mb-8">
                  Start writing articles to see your analytics here!
                </p>
              </div>
            )}
          </div>
        )}

        {!isConnected && activeTab === 'author' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Wallet</h3>
            <p className="text-gray-400 mb-8">
              Connect your wallet to view your personal analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;