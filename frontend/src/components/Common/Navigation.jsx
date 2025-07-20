import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletConnect, { useWallet } from './WalletConnect';

const Navigation = () => {
  const location = useLocation();
  const { isConnected } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Discover', icon: '🏠' },
    { path: '/write', label: 'Write', icon: '✍️', requiresWallet: true },
    { path: '/nft-marketplace', label: 'NFTs', icon: '🎨' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-white">Mirror Clone</span>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
              Powered by Irys
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.requiresWallet && !isConnected) {
                return (
                  <span
                    key={item.path}
                    className="text-gray-500 cursor-not-allowed flex items-center space-x-2"
                    title="Connect wallet to write articles"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Connect */}
          <div className="hidden md:block">
            <WalletConnect />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-4">
              
              {/* Mobile Navigation Items */}
              {navItems.map((item) => {
                if (item.requiresWallet && !isConnected) {
                  return (
                    <span
                      key={item.path}
                      className="text-gray-500 cursor-not-allowed flex items-center space-x-3 px-2 py-2"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      <span className="text-xs">(Connect wallet)</span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-2 py-2 rounded-lg transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-indigo-400 bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Wallet Connect */}
              <div className="pt-4 border-t border-gray-800">
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;