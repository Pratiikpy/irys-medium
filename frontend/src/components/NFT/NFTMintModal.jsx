import React, { useState } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const NFTMintModal = ({ 
  isOpen, 
  onClose, 
  articleId, 
  articleTitle, 
  onMintSuccess 
}) => {
  const { isConnected, walletAddress } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(null);
  const [nftData, setNftData] = useState({
    name: articleTitle,
    description: '',
    price: '0.01',
    royalty_percentage: '10',
    collection_name: '',
    attributes: []
  });

  const handleMint = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!nftData.name || !nftData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      const nftCreateData = {
        article_id: articleId,
        creator_wallet: walletAddress,
        name: nftData.name,
        description: nftData.description,
        price: parseFloat(nftData.price),
        royalty_percentage: parseFloat(nftData.royalty_percentage),
        collection_name: nftData.collection_name || 'Mirror Clone Articles',
        attributes: nftData.attributes,
        minted_at: new Date().toISOString(),
        status: 'minted'
      };

      const result = await apiService.createNFT(nftCreateData);
      
      if (onMintSuccess) {
        onMintSuccess(result);
      }
      
      onClose();
    } catch (err) {
      console.error('NFT minting error:', err);
      setError('Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const addAttribute = () => {
    setNftData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }));
  };

  const updateAttribute = (index, field, value) => {
    setNftData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (index) => {
    setNftData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Mint Article as NFT</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">NFT Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  NFT Name *
                </label>
                <input
                  type="text"
                  value={nftData.name}
                  onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter NFT name"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={nftData.collection_name}
                  onChange={(e) => setNftData(prev => ({ ...prev, collection_name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter collection name"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={nftData.description}
                onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                placeholder="Describe your NFT..."
              />
            </div>
          </div>

          {/* Pricing & Royalties */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Pricing & Royalties</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Initial Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={nftData.price}
                  onChange={(e) => setNftData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  placeholder="0.01"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Royalty Percentage (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="50"
                  value={nftData.royalty_percentage}
                  onChange={(e) => setNftData(prev => ({ ...prev, royalty_percentage: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-white">Attributes (Optional)</h4>
              <button
                onClick={addAttribute}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Add Attribute
              </button>
            </div>
            
            <div className="space-y-3">
              {nftData.attributes.map((attr, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="Trait type (e.g., Rarity)"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="Value (e.g., Legendary)"
                  />
                  <button
                    onClick={() => removeAttribute(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleMint}
              disabled={!isConnected || isMinting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isMinting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Minting NFT...
                </div>
              ) : (
                'Mint NFT'
              )}
            </button>
          </div>

          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ⚠️ Please connect your wallet to mint NFTs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTMintModal; 