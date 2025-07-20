import React, { useState } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const SubscriptionCard = ({ 
  authorWallet, 
  authorName, 
  subscriptionTier, 
  price, 
  currency = 'ETH',
  isSubscribed = false,
  onSubscriptionChange 
}) => {
  const { isConnected, walletAddress } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const subscriptionData = {
        subscriber_wallet: walletAddress,
        author_wallet: authorWallet,
        tier: subscriptionTier,
        price: price,
        currency: currency,
        subscribed_at: new Date().toISOString(),
        status: 'active'
      };

      await apiService.createSubscription(subscriptionData);
      
      if (onSubscriptionChange) {
        onSubscriptionChange(true);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Note: This would require an unsubscribe endpoint in the API
      // For now, we'll just call the subscription change callback
      if (onSubscriptionChange) {
        onSubscriptionChange(false);
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{authorName}</h3>
          <p className="text-gray-400 text-sm">{subscriptionTier} Tier</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white">{price} {currency}</div>
          <div className="text-gray-400 text-sm">per month</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
          <span>✨</span>
          <span>Exclusive content access</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
          <span>💬</span>
          <span>Priority comments</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span>🎁</span>
          <span>Early access to new articles</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={!isConnected || isProcessing}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isSubscribed
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        } disabled:bg-gray-600 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isSubscribed ? 'Unsubscribing...' : 'Subscribing...'}
          </div>
        ) : (
          isSubscribed ? 'Unsubscribe' : `Subscribe for ${price} ${currency}/month`
        )}
      </button>

      {!isConnected && (
        <div className="mt-3 p-2 bg-yellow-900 border border-yellow-700 rounded-lg">
          <p className="text-yellow-200 text-xs text-center">
            ⚠️ Connect wallet to subscribe
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard; 