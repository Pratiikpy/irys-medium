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

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!isConnected || !articleId) return;

    setIsPurchasing(true);
    try {
      const purchaseData = {
        article_id: articleId,
        buyer_wallet: walletAddress,
        amount: parseFloat(price),
        currency: currency,
        purchase_type: 'paid_content'
      };

      await apiService.createPurchase(purchaseData);
      
      alert('Content purchased successfully! You now have full access.');
      onPurchaseSuccess && onPurchaseSuccess();
    } catch (error) {
      console.error('Error purchasing content:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Purchase Premium Content</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Article Info */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Article</h4>
            <p className="text-gray-300 text-sm">{articleTitle}</p>
          </div>

          {/* Purchase Details */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-3">What you get:</h4>
            <ul className="text-blue-200 text-sm space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Full article access</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Premium content sections</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Downloadable resources</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Lifetime access</span>
              </li>
            </ul>
          </div>

          {/* Price */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Price:</span>
              <span className="text-blue-400 font-bold text-xl">
                {price} {currency}
              </span>
            </div>
            <div className="text-gray-500 text-sm mt-1">
              Plus network fees
            </div>
          </div>

          {/* Purchase Agreement */}
          <div className="text-gray-400 text-xs">
            By purchasing, you agree to the platform's terms and conditions. 
            This purchase grants you permanent access to this content.
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isPurchasing || !isConnected}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isPurchasing ? 'Processing...' : `Purchase ${price} ${currency}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaidContentModal;