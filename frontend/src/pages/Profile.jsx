import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../components/Common/WalletConnect';
import apiService from '../services/api';
import RevenueDashboard from '../components/Monetization/RevenueDashboard';
import SubscriptionCard from '../components/Monetization/SubscriptionCard';

const Profile = () => {
  const { walletAddress } = useParams();
  const { walletAddress: currentWallet } = useWallet();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('articles');

  const isOwnProfile = walletAddress === currentWallet;

  useEffect(() => {
    if (walletAddress) {
      fetchProfile();
      fetchArticles();
    }
  }, [walletAddress]);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getAuthorProfile(walletAddress);
      setProfile(data);
      setEditForm({
        name: data?.name || '',
        bio: data?.bio || '',
        avatar_url: data?.avatar_url || '',
        social_links: data?.social_links || {}
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    }
  };

  const fetchArticles = async () => {
    try {
      const data = await apiService.getArticlesByAuthor(walletAddress, 20, 0);
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await apiService.updateAuthorProfile(walletAddress, editForm);
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-800 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800 rounded"></div>
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
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {profile?.name?.charAt(0) || walletAddress?.charAt(2) || '?'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile?.name || 'Anonymous Author'}
                </h1>
                <p className="text-gray-400 mb-2">
                  Wallet: <span className="font-mono">{formatAddress(walletAddress)}</span>
                </p>
                {profile?.bio && (
                  <p className="text-gray-300 max-w-2xl">{profile.bio}</p>
                )}
              </div>
            </div>
            
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{articles.length}</div>
              <div className="text-gray-400 text-sm">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {profile?.stats?.total_views || 0}
              </div>
              <div className="text-gray-400 text-sm">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {profile?.stats?.total_comments || 0}
              </div>
              <div className="text-gray-400 text-sm">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {profile?.stats?.followers || 0}
              </div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>
          </div>

          {/* Social Links */}
          {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Social Links</h3>
              <div className="flex space-x-4">
                {profile.social_links.twitter && (
                  <a
                    href={profile.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Twitter
                  </a>
                )}
                {profile.social_links.github && (
                  <a
                    href={profile.social_links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {profile.social_links.website && (
                  <a
                    href={profile.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-8 mb-6">
          <button
            onClick={() => setActiveTab('articles')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'articles'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Articles
          </button>
          {isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'revenue'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'subscriptions'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Subscriptions
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Articles Yet</h3>
                <p className="text-gray-400 mb-6">
                  {isOwnProfile ? 'Start writing your first article!' : 'This author hasn\'t published any articles yet.'}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/write"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Write Your First Article
                  </Link>
                )}
              </div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        <Link
                          to={`/article/${article.id}`}
                          className="hover:text-indigo-400 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">{article.excerpt}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>📅 {formatDate(article.published_at)}</span>
                        <span>👁️ {article.views} views</span>
                        <span>⏱️ {article.reading_time} min read</span>
                        {article.irys_id && (
                          <span className="text-green-400">⛓️ Permanent</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'revenue' && isOwnProfile && (
          <RevenueDashboard />
        )}

        {activeTab === 'subscriptions' && isOwnProfile && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Subscription Tiers</h3>
              <p className="text-gray-400 mb-6">
                Set up subscription tiers to monetize your content and build a community.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SubscriptionCard
                  authorWallet={walletAddress}
                  authorName={profile?.name || 'You'}
                  subscriptionTier="Basic"
                  price="0.01"
                  currency="ETH"
                  isSubscribed={false}
                />
                <SubscriptionCard
                  authorWallet={walletAddress}
                  authorName={profile?.name || 'You'}
                  subscriptionTier="Premium"
                  price="0.05"
                  currency="ETH"
                  isSubscribed={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 