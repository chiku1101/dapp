import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnection = ({ onConnectionChange }) => {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    onConnectionChange?.(!!account);
  }, [account, onConnectionChange]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
          <span className="font-semibold">{formatAddress(account)}</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-3 w-80 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 py-2 z-50 animate-fadeIn">
            <div className="px-6 py-4 border-b border-white/20">
              <p className="text-sm font-semibold text-white">Connected Wallet</p>
              <p className="text-xs text-gray-300 font-mono mt-1 break-all">{account}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-300">Connected to Sepolia</span>
              </div>
            </div>
            <button
              onClick={() => {
                disconnectWallet();
                setShowDropdown(false);
              }}
              className="w-full text-left px-6 py-3 text-sm text-red-300 hover:bg-red-500/20 transition-colors rounded-b-2xl"
            >
              🔌 Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="group relative flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
      <div className="relative flex items-center space-x-3">
        {isConnecting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold">Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold">Connect Wallet</span>
          </>
        )}
      </div>
    </button>
  );
};

export default WalletConnection;