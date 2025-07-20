import React, { useState, useEffect, createContext, useContext } from 'react';
import irysService from '../../services/irys';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await irysService.initializeIrys();
      const address = await irysService.getWalletAddress();
      const bal = await irysService.getBalance();

      setWalletAddress(address);
      setBalance(bal);
      setIsConnected(true);
      
      // Store connection status
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('wallet_address', address);

      console.log('✅ Wallet connected:', address);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setBalance('0');
    setError(null);
    
    // Clear local storage
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_address');
    
    console.log('👋 Wallet disconnected');
  };

  const refreshBalance = async () => {
    if (isConnected) {
      try {
        const bal = await irysService.getBalance();
        setBalance(bal);
      } catch (err) {
        console.error('Error refreshing balance:', err);
      }
    }
  };

  const fundNode = async (amount) => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    try {
      await irysService.fundNode(amount);
      await refreshBalance();
      return true;
    } catch (err) {
      console.error('Error funding node:', err);
      throw err;
    }
  };

  // Auto-reconnect on page load
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('wallet_connected');
      const storedAddress = localStorage.getItem('wallet_address');
      
      if (wasConnected === 'true' && storedAddress && window.ethereum) {
        try {
          setIsConnecting(true);
          await connectWallet();
        } catch (err) {
          console.log('Auto-reconnect failed:', err.message);
          // Clear stale connection data
          localStorage.removeItem('wallet_connected');
          localStorage.removeItem('wallet_address');
        } finally {
          setIsConnecting(false);
        }
      }
    };

    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          // Account changed, reconnect
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page on chain change
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletAddress]);

  const value = {
    isConnected,
    walletAddress,
    balance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    fundNode
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

const WalletConnect = () => {
  const { 
    isConnected, 
    walletAddress, 
    balance, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet,
    fundNode 
  } = useWallet();

  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('0.001');
  const [isFunding, setIsFunding] = useState(false);

  const handleFundNode = async () => {
    setIsFunding(true);
    try {
      await fundNode(fundAmount);
      setShowFundModal(false);
      alert(`Successfully funded ${fundAmount} ETH to Irys node!`);
    } catch (err) {
      alert(`Funding failed: ${err.message}`);
    } finally {
      setIsFunding(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              <span>Connect Wallet</span>
            </>
          )}
        </button>
        
        {error && (
          <div className="text-red-400 text-sm text-center max-w-md">
            {error}
          </div>
        )}
        
        {!window.ethereum && (
          <p className="text-gray-400 text-sm text-center">
            Please install MetaMask to connect your wallet
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Balance and Fund Button */}
      <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-2">
        <div className="text-sm">
          <div className="text-gray-400">Irys Balance</div>
          <div className="text-green-400 font-mono">{formatBalance(balance)} ETH</div>
        </div>
        <button
          onClick={() => setShowFundModal(true)}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
        >
          Fund
        </button>
      </div>

      {/* Wallet Address */}
      <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-2">
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        <span className="text-gray-300 font-mono text-sm">
          {formatAddress(walletAddress)}
        </span>
        <button
          onClick={disconnectWallet}
          className="text-gray-400 hover:text-red-400 text-sm"
          title="Disconnect"
        >
          ×
        </button>
      </div>

      {/* Fund Node Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Fund Irys Node</h3>
            <p className="text-gray-400 text-sm mb-4">
              Fund your Irys node to upload articles permanently. Recommended: 0.001 ETH for multiple uploads.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                placeholder="0.001"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowFundModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFundNode}
                disabled={isFunding || !fundAmount || parseFloat(fundAmount) <= 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 px-4 rounded-lg"
              >
                {isFunding ? 'Funding...' : 'Fund Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;