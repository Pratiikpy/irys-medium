import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const NFTCard = ({ nft, onPurchase, isOwner }) => {
  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors duration-200">
      {/* NFT Image/Preview */}
      <div className="aspect-square bg-gradient-to-br from-purple-600 to-blue-600 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🎨</div>
          <div className="text-white font-bold text-lg mb-1">{nft.name}</div>
          <div className="text-purple-200 text-sm">Article NFT</div>
        </div>
      </div>

      {/* NFT Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
            {nft.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {nft.description}
          </p>
        </div>

        {/* Creator Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {nft.creator_wallet?.charAt(2) || '?'}
            </span>
          </div>
          <div>
            <div className="text-gray-300 text-sm font-medium">
              {formatAddress(nft.creator_wallet)}
            </div>
            <div className="text-gray-500 text-xs">Creator</div>
          </div>
        </div>

        {/* Price and Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-gray-400 text-xs">Price</div>
            <div className="text-green-400 font-bold text-lg">
              {nft.current_price || nft.initial_price} {nft.currency}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-xs">Minted</div>
            <div className="text-gray-300 text-sm">
              {formatDate(nft.created_at)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {isOwner ? (
            <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-3 text-center">
              <span className="text-green-400 font-medium">✓ You own this NFT</span>
            </div>
          ) : nft.is_listed ? (
            <button
              onClick={() => onPurchase(nft)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Buy Now
            </button>
          ) : (
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <span className="text-gray-400">Not for sale</span>
            </div>
          )}
          
          <Link
            to={`/article/${nft.article_id}`}
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 text-center rounded-lg transition-colors duration-200 text-sm"
          >
            View Original Article →
          </Link>
        </div>
      </div>
    </div>
  );
};

const NFTMarketplace = () => {
  const { isConnected, walletAddress } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, listed, owned
  const [sortBy, setSortBy] = useState('recent'); // recent, price_low, price_high
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchNFTs();
    fetchStats();
  }, [filter, sortBy]);

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      let data = [];
      
      if (filter === 'listed') {
        data = await apiService.getListedNFTs(50, 0);
      } else if (filter === 'owned' && walletAddress) {
        // This would need a new API endpoint for user's NFTs
        data = [];
      } else {
        data = await apiService.getListedNFTs(50, 0);
      }
      
      // Apply sorting
      if (sortBy === 'price_low') {
        data.sort((a, b) => parseFloat(a.current_price || a.initial_price) - parseFloat(b.current_price || b.initial_price));
      } else if (sortBy === 'price_high') {
        data.sort((a, b) => parseFloat(b.current_price || b.initial_price) - parseFloat(a.current_price || a.initial_price));
      } else {
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      setNfts(data);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getNFTStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching NFT stats:', error);
    }
  };

  const handlePurchaseNFT = async (nft) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }

    if (walletAddress === nft.creator_wallet) {
      alert('You cannot purchase your own NFT');
      return;
    }

    const confirmed = confirm(
      `Purchase "${nft.name}" for ${nft.current_price || nft.initial_price} ${nft.currency}?`
    );
    
    if (!confirmed) return;

    try {
      const saleData = {
        nft_id: nft.id,
        buyer_wallet: walletAddress,
        seller_wallet: nft.creator_wallet,
        price: parseFloat(nft.current_price || nft.initial_price),
        currency: nft.currency
      };

      await apiService.createNFTSale(saleData);
      alert('NFT purchased successfully!');
      fetchNFTs(); // Refresh the list
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            NFT Marketplace
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover and collect exclusive NFTs created from articles. 
            Own a piece of digital publishing history.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-white">{stats.total_nfts || 0}</div>
              <div className="text-gray-400 text-sm">Total NFTs</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-white">{stats.total_listed || 0}</div>
              <div className="text-gray-400 text-sm">Listed</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-white">{stats.total_volume || '0.00'}</div>
              <div className="text-gray-400 text-sm">Volume (ETH)</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-white">{stats.floor_price || '0.00'}</div>
              <div className="text-gray-400 text-sm">Floor Price (ETH)</div>
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Filter Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All NFTs
            </button>
            <button
              onClick={() => setFilter('listed')}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'listed'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              For Sale
            </button>
            {isConnected && (
              <button
                onClick={() => setFilter('owned')}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  filter === 'owned'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                My NFTs
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="recent">Recently Listed</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* NFT Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {filter === 'owned' ? 'No NFTs in your collection' : 'No NFTs available'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {filter === 'owned' 
                ? 'Start minting NFTs from your articles to build your collection!'
                : 'Be the first to mint an NFT from your article!'
              }
            </p>
            <Link
              to="/write"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Write Article & Mint NFT
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onPurchase={handlePurchaseNFT}
                isOwner={walletAddress === nft.creator_wallet}
              />
            ))}
          </div>
        )}

        {/* Create NFT CTA */}
        {isConnected && nfts.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Create Your Own NFT
              </h3>
              <p className="text-gray-300 mb-6">
                Turn your articles into unique NFTs and earn from your creative work.
              </p>
              <Link
                to="/write"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Write & Mint NFT
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplace;