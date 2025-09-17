import { ethers } from 'ethers';

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
  }

  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.account = await this.signer.getAddress();
        
        return {
          success: true,
          account: this.account
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    } else {
      return {
        success: false,
        error: 'MetaMask not installed'
      };
    }
  }

  async getNetwork() {
    if (this.provider) {
      return await this.provider.getNetwork();
    }
    return null;
  }

  isConnected() {
    return this.account !== null;
  }

  getAccount() {
    return this.account;
  }

  getSigner() {
    return this.signer;
  }
}

export default new WalletService();