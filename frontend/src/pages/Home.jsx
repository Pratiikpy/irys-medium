import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { useWallet } from '../components/Common/WalletConnect';

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-colors duration-200 cursor-pointer group">
      <Link to={`/article/${article.id}`} className="block">
        
        {/* Article Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {article.author_name?.charAt(0) || article.author_wallet?.charAt(2) || '?'}
              </span>
            </div>
            <div>
              <div className="text-gray-300 font-medium text-sm">
                {article.author_name || formatAddress(article.author_wallet)}
              </div>
              <div className="text-gray-500 text-xs">
                {formatDate(article.published_at)}
              </div>
            </div>
          </div>
          
          {/* Reading Time */}
          <div className="text-gray-500 text-xs">
            {article.reading_time} min read
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2">
          {article.title}
        </h2>

        {/* Excerpt */}
        <p className="text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
          {article.excerpt}
        </p>

        {/* Tags and Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500 text-xs">
            <div className="flex items-center space-x-1">
              <span>👁️</span>
              <span>{article.views}</span>
            </div>
            <div className="text-green-400 font-mono">
              ⛓️ Permanent
            </div>
          </div>
        </div>

      </Link>
    </div>
  );
};

const SearchBar = ({ onSearch, onCategoryChange, categories }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, category: selectedCategory });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search articles, authors, or topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              onCategoryChange(e.target.value);
            }}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Search
        </button>
      </form>
    </div>
  );
};

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isConnected } = useWallet();

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await apiService.getArticles(20, 0);
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = async ({ query, category }) => {
    setSearching(true);
    setHasSearched(true);
    
    try {
      const searchQuery = {
        query: query || undefined,
        category: category || undefined,
        limit: 20,
        offset: 0
      };
      
      const data = await apiService.searchArticles(searchQuery);
      setArticles(data);
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCategoryChange = (category) => {
    if (category) {
      handleSearch({ category });
    } else {
      loadArticles();
      setHasSearched(false);
    }
  };

  useEffect(() => {
    loadArticles();
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Decentralized Publishing
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Write, publish, and discover articles stored permanently on the blockchain. 
            Your content, your ownership, forever.
          </p>
          
          {!isConnected ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-gray-300 mb-4">
                Connect your wallet to start publishing articles permanently on Irys.
              </p>
              <div className="text-sm text-gray-400">
                ⛓️ Permanent Storage • 🔐 Decentralized • 💰 Minimal Cost
              </div>
            </div>
          ) : (
            <Link
              to="/write"
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <span>✍️</span>
              <span className="ml-2">Write Your First Article</span>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <SearchBar 
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          categories={categories}
        />

        {/* Articles Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {hasSearched ? 'Search Results' : 'Recent Articles'}
            </h2>
            {articles.length > 0 && (
              <div className="text-gray-400 text-sm">
                {articles.length} article{articles.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          {/* Loading State */}
          {(loading || searching) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded mb-3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Articles Grid */}
          {!loading && !searching && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !searching && articles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {hasSearched ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {hasSearched 
                  ? 'Try adjusting your search terms or browse all articles.'
                  : 'Be the first to publish an article on this decentralized platform!'
                }
              </p>
              {isConnected && !hasSearched && (
                <Link
                  to="/write"
                  className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  ✍️ Write First Article
                </Link>
              )}
              {hasSearched && (
                <button
                  onClick={() => {
                    loadArticles();
                    setHasSearched(false);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View All Articles →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {articles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-400">{articles.length}+</div>
                <div className="text-gray-400">Articles Published</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">∞</div>
                <div className="text-gray-400">Years of Permanence</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">⛓️</div>
                <div className="text-gray-400">Powered by Irys</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;