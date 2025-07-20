import React, { useState, useEffect } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const NFTMarketplace = () => {
  const { isConnected, walletAddress } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    collection: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchNFTs();
  }, [filters]);

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getListedNFTs(
        20, // limit
        0,  // offset
        filters.minPrice ? parseFloat(filters.minPrice) : 0,
        filters.maxPrice ? parseFloat(filters.maxPrice) : null
      );
      setNfts(data);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (nftId, price) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const saleData = {
        nft_id: nftId,
        buyer_wallet: walletAddress,
        price: price,
        sold_at: new Date().toISOString(),
        status: 'completed'
      };

      await apiService.createNFTSale(saleData);
      alert('NFT purchased successfully!');
      fetchNFTs(); // Refresh the list
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Failed to purchase NFT. Please try again.');
    }
  };

  const formatPrice = (price) => {
    return `${parseFloat(price).toFixed(4)} ETH`;
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="h-48 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">NFT Marketplace</h1>
          <p className="text-gray-400">
            Discover and collect unique article NFTs from your favorite authors
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Min Price (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                placeholder="0.001"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Max Price (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                placeholder="1.0"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Collection
              </label>
              <input
                type="text"
                value={filters.collection}
                onChange={(e) => setFilters(prev => ({ ...prev, collection: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                placeholder="Collection name"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* NFT Grid */}
        {nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
            <p className="text-gray-400">
              Try adjusting your filters or check back later for new listings
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <div key={nft.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
                {/* NFT Image/Preview */}
                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-white text-sm font-medium">Article NFT</p>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {nft.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {nft.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Creator:</span>
                      <span className="text-white font-mono">
                        {formatAddress(nft.creator_wallet)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Collection:</span>
                      <span className="text-white">{nft.collection_name}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Royalty:</span>
                      <span className="text-white">{nft.royalty_percentage}%</span>
                    </div>
                  </div>

                  {/* Price and Purchase */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">Price:</span>
                      <span className="text-xl font-bold text-white">
                        {formatPrice(nft.price)}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handlePurchase(nft.id, nft.price)}
                      disabled={!isConnected}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {isConnected ? 'Purchase NFT' : 'Connect Wallet'}
                    </button>
                  </div>

                  {/* Attributes */}
                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Attributes</h4>
                      <div className="flex flex-wrap gap-2">
                        {nft.attributes.slice(0, 3).map((attr, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {attr.trait_type}: {attr.value}
                          </span>
                        ))}
                        {nft.attributes.length > 3 && (
                          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                            +{nft.attributes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplace; 