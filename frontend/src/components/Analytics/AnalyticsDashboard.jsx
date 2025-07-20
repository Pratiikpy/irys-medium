import React, { useState, useEffect } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const AnalyticsDashboard = () => {
  const { walletAddress } = useWallet();
  const [platformStats, setPlatformStats] = useState(null);
  const [articleStats, setArticleStats] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch platform stats
      const platformData = await apiService.getPlatformStats();
      setPlatformStats(platformData);

      // Fetch trending articles
      const trendingData = await apiService.getTrendingArticles(10);
      setTrendingArticles(trendingData);

      // Fetch article stats if wallet is connected
      if (walletAddress) {
        const articleData = await apiService.getAuthorStats(walletAddress);
        setArticleStats(articleData);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${(parseFloat(value) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-4">Analytics Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">
              Platform insights and performance metrics
            </p>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Platform Stats */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Articles</p>
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(platformStats.total_articles)}
                  </p>
                </div>
                <div className="text-blue-400 text-3xl">📄</div>
              </div>
              <div className="mt-2">
                <span className={`text-sm ${platformStats.articles_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {platformStats.articles_growth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(platformStats.articles_growth))}
                </span>
                <span className="text-gray-400 text-sm ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Authors</p>
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(platformStats.total_authors)}
                  </p>
                </div>
                <div className="text-green-400 text-3xl">👥</div>
              </div>
              <div className="mt-2">
                <span className={`text-sm ${platformStats.authors_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {platformStats.authors_growth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(platformStats.authors_growth))}
                </span>
                <span className="text-gray-400 text-sm ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(platformStats.total_views)}
                  </p>
                </div>
                <div className="text-yellow-400 text-3xl">👁️</div>
              </div>
              <div className="mt-2">
                <span className={`text-sm ${platformStats.views_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {platformStats.views_growth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(platformStats.views_growth))}
                </span>
                <span className="text-gray-400 text-sm ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Comments</p>
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(platformStats.total_comments)}
                  </p>
                </div>
                <div className="text-purple-400 text-3xl">💬</div>
              </div>
              <div className="mt-2">
                <span className={`text-sm ${platformStats.comments_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {platformStats.comments_growth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(platformStats.comments_growth))}
                </span>
                <span className="text-gray-400 text-sm ml-1">vs last period</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Author Stats */}
          {articleStats && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Your Performance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Articles Published</p>
                    <p className="text-2xl font-bold text-white">{articleStats.articles_published}</p>
                  </div>
                  <div className="text-blue-400 text-2xl">📝</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(articleStats.total_views)}</p>
                  </div>
                  <div className="text-yellow-400 text-2xl">👁️</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Total Comments</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(articleStats.total_comments)}</p>
                  </div>
                  <div className="text-purple-400 text-2xl">💬</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Views per Article</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(articleStats.avg_views_per_article)}</p>
                  </div>
                  <div className="text-green-400 text-2xl">📈</div>
                </div>
              </div>
            </div>
          )}

          {/* Trending Articles */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Trending Articles</h3>
            
            <div className="space-y-4">
              {trendingArticles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📊</div>
                  <p className="text-gray-400">No trending articles yet</p>
                </div>
              ) : (
                trendingArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-400 w-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{article.title}</h4>
                      <p className="text-gray-400 text-sm">
                        by {article.author_name || 'Anonymous'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatNumber(article.views)}</p>
                      <p className="text-gray-400 text-xs">views</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {platformStats && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Engagement Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Reading Time:</span>
                  <span className="text-white">{platformStats.avg_reading_time} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Comments per Article:</span>
                  <span className="text-white">{platformStats.avg_comments_per_article}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Engagement Rate:</span>
                  <span className="text-white">{formatPercentage(platformStats.engagement_rate)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Content Distribution</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Technology:</span>
                  <span className="text-white">{formatPercentage(platformStats.category_distribution?.technology || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Finance:</span>
                  <span className="text-white">{formatPercentage(platformStats.category_distribution?.finance || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Culture:</span>
                  <span className="text-white">{formatPercentage(platformStats.category_distribution?.culture || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Platform Health</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Users:</span>
                  <span className="text-white">{formatNumber(platformStats.active_users)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Retention Rate:</span>
                  <span className="text-white">{formatPercentage(platformStats.retention_rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-white">{formatPercentage(platformStats.uptime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 