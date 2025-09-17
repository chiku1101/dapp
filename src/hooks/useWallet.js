import { useState, useEffect } from 'react';
import walletService from '../services/walletService';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    const result = await walletService.connectWallet();
    
    if (result.success) {
      setAccount(result.account);
    } else {
      setError(result.error);
    }
    
    setIsConnecting(false);
  };

  const disconnect = () => {
    setAccount(null);
    walletService.account = null;
  };

  useEffect(() => {
    // Check if already connected
    if (walletService.isConnected()) {
      setAccount(walletService.getAccount());
    }

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  return {
    account,
    isConnecting,
    error,
    connectWallet,
    disconnect,
    isConnected: !!account
  };
};