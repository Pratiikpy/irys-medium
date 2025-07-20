import React, { useState } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const PaidContentModal = ({ 
  isOpen, 
  onClose, 
  articleId, 
  articleTitle, 
  price, 
  currency = 'ETH',
  onPurchaseSuccess 
}) => {
  const { isConnected, walletAddress } = useWallet();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      const purchaseData = {
        article_id: articleId,
        buyer_wallet: walletAddress,
        price: price,
        currency: currency,
        purchased_at: new Date().toISOString()
      };

      await apiService.createPurchase(purchaseData);
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Failed to purchase content. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Premium Content</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-2">{articleTitle}</h4>
          <p className="text-gray-400 text-sm mb-4">
            This is premium content that requires a one-time purchase to access.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Price:</span>
              <span className="text-white font-semibold">{price} {currency}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handlePurchase}
            disabled={!isConnected || isPurchasing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isPurchasing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Purchasing...
              </div>
            ) : (
              `Purchase for ${price} ${currency}`
            )}
          </button>
        </div>

        {!isConnected && (
          <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
            <p className="text-yellow-200 text-sm">
              ⚠️ Please connect your wallet to purchase this content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaidContentModal; 