import React, { useState } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const SubscriptionCard = ({ 
  authorWallet, 
  authorName, 
  subscriptionTier, 
  price, 
  currency = 'ETH',
  isSubscribed = false 
}) => {
  const { isConnected, walletAddress } = useWallet();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubscribe = async () => {
    if (!isConnected || walletAddress === authorWallet) return;

    setIsSubscribing(true);
    try {
      const subscriptionData = {
        subscriber_wallet: walletAddress,
        author_wallet: authorWallet,
        tier: subscriptionTier,
        price: parseFloat(price),
        currency: currency,
        duration_months: subscriptionTier === 'Basic' ? 1 : 3
      };

      await apiService.createSubscription(subscriptionData);
      alert(`Successfully subscribed to ${authorName}'s ${subscriptionTier} tier!`);
      setShowModal(false);
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getCardColor = (tier) => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return 'border-blue-500 bg-blue-900 bg-opacity-20';
      case 'premium':
        return 'border-purple-500 bg-purple-900 bg-opacity-20';
      case 'vip':
        return 'border-yellow-500 bg-yellow-900 bg-opacity-20';
      default:
        return 'border-gray-500 bg-gray-900 bg-opacity-20';
    }
  };

  const getFeatures = (tier) => {
    const baseFeatures = ['Access to all articles', 'Comment on articles', 'Basic support'];
    
    switch (tier.toLowerCase()) {
      case 'basic':
        return [
          ...baseFeatures,
          'Early access to new articles',
          'Monthly newsletter'
        ];
      case 'premium':
        return [
          ...baseFeatures,
          'Premium exclusive content',
          'Direct message with author',
          'Priority support',
          'Downloadable resources'
        ];
      case 'vip':
        return [
          ...baseFeatures,
          'All premium benefits',
          '1-on-1 video calls',
          'Custom content requests',
          'White-label access'
        ];
      default:
        return baseFeatures;
    }
  };

  return (
    <>
      <div className={`border-2 rounded-xl p-6 ${getCardColor(subscriptionTier)}`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">{subscriptionTier}</h3>
          <div className="text-3xl font-bold text-white mb-1">
            {price} {currency}
            <span className="text-lg text-gray-400 font-normal">/mo</span>
          </div>
          <p className="text-gray-400 text-sm">
            Support {authorName} and get exclusive benefits
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {getFeatures(subscriptionTier).map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-green-400 text-sm">✓</span>
              <span className="text-gray-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => isSubscribed ? null : setShowModal(true)}
          disabled={!isConnected || isSubscribed || walletAddress === authorWallet}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            isSubscribed
              ? 'bg-green-600 text-white cursor-not-allowed'
              : walletAddress === authorWallet
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : !isConnected
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : subscriptionTier.toLowerCase() === 'basic'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : subscriptionTier.toLowerCase() === 'premium'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          {isSubscribed 
            ? '✓ Subscribed' 
            : walletAddress === authorWallet
            ? 'Your Tier'
            : !isConnected
            ? 'Connect Wallet'
            : `Subscribe to ${subscriptionTier}`}
        </button>
      </div>

      {/* Subscription Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">
              Subscribe to {subscriptionTier} Tier
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Author:</span>
                  <span className="text-white font-medium">{authorName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Tier:</span>
                  <span className="text-white font-medium">{subscriptionTier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Monthly Cost:</span>
                  <span className="text-green-400 font-bold">{price} {currency}</span>
                </div>
              </div>

              <div className="text-gray-400 text-sm">
                <p>• Subscription will auto-renew monthly</p>
                <p>• Cancel anytime from your profile</p>
                <p>• Immediate access to tier benefits</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className={`flex-1 font-medium py-3 rounded-lg transition-colors ${
                  subscriptionTier.toLowerCase() === 'basic'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : subscriptionTier.toLowerCase() === 'premium'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                } ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubscribing ? 'Subscribing...' : 'Confirm Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionCard;