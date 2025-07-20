import React, { useState } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const TipButton = ({ targetWallet, articleId = null, authorName = null }) => {
  const { isConnected, walletAddress, balance } = useWallet();
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('0.001');
  const [tipMessage, setTipMessage] = useState('');
  const [isTipping, setIsTipping] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('ETH');

  const presetAmounts = [
    { value: '0.001', label: '0.001 ETH' },
    { value: '0.005', label: '0.005 ETH' },
    { value: '0.01', label: '0.01 ETH' },
    { value: '0.05', label: '0.05 ETH' },
    { value: '0.1', label: '0.1 ETH' },
    { value: 'custom', label: 'Custom' }
  ];

  const currencies = [
    { value: 'ETH', label: 'ETH', icon: 'Ξ' },
    { value: 'MATIC', label: 'MATIC', icon: '🔷' },
    { value: 'USDC', label: 'USDC', icon: '💲' }
  ];

  const handleTip = async () => {
    if (!isConnected || !tipAmount || parseFloat(tipAmount) <= 0) return;

    const amount = parseFloat(tipAmount);
    const balanceNum = parseFloat(balance);

    if (balanceNum < amount) {
      alert(`Insufficient balance. You need ${amount} ${selectedCurrency} but only have ${balanceNum} ETH.`);
      return;
    }

    setIsTipping(true);
    try {
      const tipData = {
        from_wallet: walletAddress,
        to_wallet: targetWallet,
        article_id: articleId,
        amount: amount,
        currency: selectedCurrency,
        message: tipMessage.trim() || undefined
      };

      await apiService.createTip(tipData);
      
      setShowTipModal(false);
      setTipAmount('0.001');
      setTipMessage('');
      
      alert(`Successfully tipped ${amount} ${selectedCurrency}! Thank you for supporting the creator.`);
    } catch (error) {
      console.error('Error sending tip:', error);
      alert(`Failed to send tip: ${error.message}`);
    } finally {
      setIsTipping(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => alert('Please connect your wallet to tip')}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
      >
        💝 Tip
      </button>
    );
  }

  if (walletAddress === targetWallet) {
    return null; // Don't show tip button to self
  }

  return (
    <>
      <button
        onClick={() => setShowTipModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center space-x-2"
      >
        <span>💝</span>
        <span>Tip</span>
      </button>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Send a Tip</h3>
              <button
                onClick={() => setShowTipModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Recipient Info */}
            <div className="bg-gray-750 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {authorName?.charAt(0) || targetWallet?.charAt(2) || '?'}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">
                    {authorName || formatAddress(targetWallet)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatAddress(targetWallet)}
                  </div>
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Currency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {currencies.map((currency) => (
                  <button
                    key={currency.value}
                    onClick={() => setSelectedCurrency(currency.value)}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedCurrency === currency.value
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-gray-600 bg-gray-750 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-lg mb-1">{currency.icon}</div>
                    <div className="text-xs">{currency.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Amount
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {presetAmounts.slice(0, 5).map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setTipAmount(preset.value)}
                    className={`p-2 rounded-lg border transition-colors ${
                      tipAmount === preset.value
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-gray-600 bg-gray-750 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setTipAmount('')}
                  className={`p-2 rounded-lg border transition-colors ${
                    tipAmount !== '0.001' && tipAmount !== '0.005' && tipAmount !== '0.01' && tipAmount !== '0.05' && tipAmount !== '0.1'
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-600 bg-gray-750 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  Custom
                </button>
              </div>
              
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="Enter amount"
                min="0.0001"
                step="0.0001"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Message (Optional)
              </label>
              <textarea
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                placeholder="Leave a message..."
                maxLength="200"
                rows="2"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="text-right text-gray-500 text-xs mt-1">
                {tipMessage.length}/200
              </div>
            </div>

            {/* Balance Info */}
            <div className="bg-gray-750 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your Balance:</span>
                <span className="text-white">{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
              {parseFloat(balance) < parseFloat(tipAmount || 0) && (
                <div className="text-red-400 text-xs mt-1">
                  ⚠️ Insufficient balance
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 px-4 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={isTipping || !tipAmount || parseFloat(tipAmount) <= 0 || parseFloat(balance) < parseFloat(tipAmount || 0)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isTipping ? 'Sending...' : `Send ${tipAmount} ${selectedCurrency}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TipButton; 