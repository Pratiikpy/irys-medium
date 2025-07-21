import React, { useState } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const TipButton = ({ targetWallet, articleId, authorName }) => {
  const { isConnected, walletAddress } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('0.001');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const predefinedAmounts = ['0.001', '0.005', '0.01', '0.05'];

  const handleSendTip = async () => {
    if (!isConnected || !targetWallet || !tipAmount) return;
    
    if (walletAddress === targetWallet) {
      alert('You cannot tip yourself!');
      return;
    }

    setIsSending(true);
    try {
      const tipData = {
        from_wallet: walletAddress,
        to_wallet: targetWallet,
        amount: parseFloat(tipAmount),
        currency: 'ETH',
        article_id: articleId,
        message: message.trim() || `Thanks for the great article!`
      };

      await apiService.createTip(tipData);
      alert(`Successfully sent ${tipAmount} ETH tip to ${authorName || 'the author'}!`);
      setShowModal(false);
      setMessage('');
      setTipAmount('0.001');
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isConnected) {
    return (
      <button
        disabled
        className="bg-gray-700 text-gray-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed flex items-center space-x-2"
        title="Connect wallet to send tips"
      >
        <span>💰</span>
        <span>Send Tip</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
      >
        <span>💰</span>
        <span>Send Tip</span>
      </button>

      {/* Tip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Send a Tip</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Recipient Info */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {authorName?.charAt(0) || targetWallet?.charAt(2) || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {authorName || 'Anonymous Author'}
                    </div>
                    <div className="text-gray-400 text-sm font-mono">
                      {targetWallet ? `${targetWallet.slice(0, 8)}...${targetWallet.slice(-6)}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-gray-300 font-medium mb-3">
                  Tip Amount (ETH)
                </label>
                
                {/* Predefined Amounts */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTipAmount(amount)}
                      className={`py-2 px-4 rounded-lg border transition-colors ${
                        tipAmount === amount
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {amount} ETH
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Or enter custom amount:
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="0.001"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 resize-none"
                  rows={3}
                  placeholder="Thanks for the great article!"
                  maxLength={200}
                />
                <div className="text-gray-400 text-xs mt-1">
                  {message.length}/200 characters
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total to send:</span>
                  <span className="text-green-400 font-bold text-lg">
                    {tipAmount} ETH
                  </span>
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Plus network fees
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTip}
                  disabled={isSending || !tipAmount || parseFloat(tipAmount) <= 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {isSending ? 'Sending...' : 'Send Tip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TipButton;