import React, { useState, useEffect } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const RevenueDashboard = () => {
  const { walletAddress } = useWallet();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    if (walletAddress) {
      fetchRevenueStats();
    }
  }, [walletAddress, timeframe]);

  const fetchRevenueStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getRevenueStats(walletAddress);
      setStats(data);
    } catch (err) {
      console.error('Error fetching revenue stats:', err);
      setError('Failed to load revenue statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'ETH') => {
    if (!amount) return '0';
    const num = parseFloat(amount);
    return `${num.toFixed(4)} ${currency}`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${(parseFloat(value) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">Revenue Dashboard</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">Revenue Dashboard</h3>
          <p className="text-gray-400">No revenue data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Revenue Analytics</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-1 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.total_revenue)}
              </p>
            </div>
            <div className="text-green-400 text-2xl">💰</div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${stats.revenue_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.revenue_growth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(stats.revenue_growth))}
            </span>
            <span className="text-gray-400 text-sm ml-1">vs last period</span>
          </div>
        </div>

        {/* Tips Received */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tips Received</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.tips_received)}
              </p>
            </div>
            <div className="text-yellow-400 text-2xl">💝</div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">
              {stats.tips_count} tips
            </span>
          </div>
        </div>

        {/* Paid Content */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Paid Content</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.paid_content_revenue)}
              </p>
            </div>
            <div className="text-blue-400 text-2xl">🔒</div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">
              {stats.paid_content_sales} sales
            </span>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Subscriptions</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.subscription_revenue)}
              </p>
            </div>
            <div className="text-purple-400 text-2xl">📅</div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">
              {stats.active_subscribers} active
            </span>
          </div>
        </div>

        {/* NFT Sales */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">NFT Sales</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.nft_revenue)}
              </p>
            </div>
            <div className="text-indigo-400 text-2xl">🎨</div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">
              {stats.nft_sales} sold
            </span>
          </div>
        </div>

        {/* Average per Article */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg per Article</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.avg_revenue_per_article)}
              </p>
            </div>
            <div className="text-green-400 text-2xl">📈</div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">
              {stats.total_articles} articles
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {stats.recent_activity?.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {activity.type === 'tip' && '💝'}
                  {activity.type === 'purchase' && '🔒'}
                  {activity.type === 'subscription' && '📅'}
                  {activity.type === 'nft' && '🎨'}
                </div>
                <div>
                  <p className="text-white font-medium">{activity.description}</p>
                  <p className="text-gray-400 text-sm">{activity.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{formatCurrency(activity.amount)}</p>
                <p className="text-gray-400 text-sm">{activity.currency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard; 