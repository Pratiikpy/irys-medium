import React, { useState } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const NFTMintModal = ({ isOpen, onClose, articleId, articleTitle, onMintSuccess }) => {
  const { isConnected, walletAddress } = useWallet();
  const [nftData, setNftData] = useState({
    name: `${articleTitle} - NFT`,
    description: `Exclusive NFT for the article "${articleTitle}"`,
    royalty_percentage: 10,
    initial_price: '0.01',
    currency: 'ETH'
  });
  const [isMinting, setIsMinting] = useState(false);

  if (!isOpen) return null;

  const handleMint = async () => {
    if (!isConnected || !articleId) return;

    setIsMinting(true);
    try {
      const mintData = {
        article_id: articleId,
        creator_wallet: walletAddress,
        name: nftData.name,
        description: nftData.description,
        royalty_percentage: parseFloat(nftData.royalty_percentage),
        initial_price: parseFloat(nftData.initial_price),
        currency: nftData.currency,
        metadata: {
          article_title: articleTitle,
          article_id: articleId,
          minted_at: Date.now(),
          creator: walletAddress
        }
      };

      const result = await apiService.createNFT(mintData);
      
      alert('NFT minted successfully! It will appear in the marketplace shortly.');
      onMintSuccess && onMintSuccess(result);
      onClose();
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Mint Article NFT</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Article Info */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Article</h4>
            <p className="text-gray-300 text-sm line-clamp-2">{articleTitle}</p>
          </div>

          {/* NFT Name */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              NFT Name
            </label>
            <input
              type="text"
              value={nftData.name}
              onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="My Article NFT"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Description
            </label>
            <textarea
              value={nftData.description}
              onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
              placeholder="Describe your NFT..."
            />
          </div>

          {/* Royalty */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Royalty Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={nftData.royalty_percentage}
              onChange={(e) => setNftData(prev => ({ ...prev, royalty_percentage: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-400 text-xs mt-1">
              Earn this percentage from future sales
            </p>
          </div>

          {/* Initial Price */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Initial Price (ETH)
            </label>
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={nftData.initial_price}
              onChange={(e) => setNftData(prev => ({ ...prev, initial_price: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Benefits */}
          <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg p-4">
            <h4 className="text-purple-300 font-medium mb-2">NFT Benefits</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Permanent ownership on blockchain</li>
              <li>• Tradeable on NFT marketplaces</li>
              <li>• Earn royalties from resales</li>
              <li>• Proof of original content creation</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMint}
              disabled={isMinting || !nftData.name.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMintModal;