import React, { useState, useEffect } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const RevenueDashboard = () => {
  const { walletAddress } = useWallet();
  const [revenueData, setRevenueData] = useState(null);
  const [tipsReceived, setTipsReceived] = useState([]);
  const [purchasesReceived, setPurchasesReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (walletAddress) {
      fetchRevenueData();
    }
  }, [walletAddress]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const [revenue, tips, purchases] = await Promise.all([
        apiService.getRevenueStats(walletAddress),
        apiService.getTipsReceived(walletAddress, 50),
        apiService.getUserPurchases(walletAddress, 50)
      ]);

      setRevenueData(revenue);
      setTipsReceived(tips);
      setPurchasesReceived(purchases);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Revenue Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Total Tips</p>
                <p className="text-white text-2xl font-bold">
                  {revenueData?.total_tips || '0.00'} ETH
                </p>
              </div>
              <div className="text-green-400 text-2xl">💰</div>
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Content Sales</p>
                <p className="text-white text-2xl font-bold">
                  {revenueData?.total_content_sales || '0.00'} ETH
                </p>
              </div>
              <div className="text-blue-400 text-2xl">🔒</div>
            </div>
          </div>

          <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">NFT Sales</p>
                <p className="text-white text-2xl font-bold">
                  {revenueData?.total_nft_sales || '0.00'} ETH
                </p>
              </div>
              <div className="text-purple-400 text-2xl">🎨</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-lg font-semibold">Total Revenue:</span>
            <span className="text-green-400 text-2xl font-bold">
              {revenueData?.total_revenue || '0.00'} ETH
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'tips'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tips Received
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'sales'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Content Sales
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
          
          {/* Recent Tips */}
          <div className="mb-6">
            <h5 className="text-gray-300 font-medium mb-3">Recent Tips</h5>
            {tipsReceived.slice(0, 5).length === 0 ? (
              <p className="text-gray-400 text-sm">No tips received yet</p>
            ) : (
              <div className="space-y-3">
                {tipsReceived.slice(0, 5).map((tip) => (
                  <div key={tip.id} className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {tip.from_wallet?.charAt(2) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          Tip from {formatAddress(tip.from_wallet)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatDate(tip.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-green-400 font-semibold">
                      +{tip.amount} {tip.currency}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">All Tips Received</h4>
          
          {tipsReceived.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💰</div>
              <p className="text-gray-400">No tips received yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Keep writing great content to receive tips from readers!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tipsReceived.map((tip) => (
                <div key={tip.id} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {tip.from_wallet?.charAt(2) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          From {formatAddress(tip.from_wallet)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatDate(tip.created_at)}
                        </p>
                        {tip.message && (
                          <p className="text-gray-300 text-sm mt-1 italic">
                            "{tip.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">
                        +{tip.amount} {tip.currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Content Sales</h4>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-gray-400">No content sales yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Create premium content to start earning from sales!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueDashboard;