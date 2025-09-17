import { ethers } from 'ethers';
import deployedContract from '../contracts/deployed.json';

const CONTRACT_ABI = [
  "function issueCredential(bytes32 credentialId, string memory ipfsCid, string memory subjectDid) external",
  "function getCredential(bytes32 credentialId) external view returns (tuple(string ipfsCid, address issuer, string subjectDid, uint256 timestamp, bool revoked))",
  "function revokeCredential(bytes32 credentialId) external",
  "event CredentialIssued(bytes32 indexed credentialId, string ipfsCid, address indexed issuer, string subjectDid)"
];

class ContractService {
  constructor() {
    this.contract = null;
    // Prefer env var; fallback to JSON
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || deployedContract.address;
  }

  initialize(contractAddress, signer) {
    this.contractAddress = contractAddress || this.contractAddress;
    this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer);
  }

  // Validate there is code at the configured address on the wallet's current network
  async validateContractDeployment() {
    const provider = this.contract?.runner?.provider;
    if (!provider) {
      throw new Error('Provider not available from signer. Please reconnect your wallet.');
    }
    if (!this.contractAddress) {
      throw new Error('Contract address is not set. Configure VITE_CONTRACT_ADDRESS or src/contracts/deployed.json');
    }
    const code = await provider.getCode(this.contractAddress);
    if (!code || code === '0x') {
      throw new Error(`No contract deployed at ${this.contractAddress} on the current wallet network. Ensure the contract is deployed and the address matches (VITE_CONTRACT_ADDRESS or src/contracts/deployed.json).`);
    }
  }

  async issueCredential(credentialId, ipfsCid, subjectDid) {
    try {
      await this.validateContractDeployment();
      const tx = await this.contract.issueCredential(credentialId, ipfsCid, subjectDid);
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCredential(credentialId) {
    try {
      await this.validateContractDeployment();
      const credential = await this.contract.getCredential(credentialId);
      
      return {
        success: true,
        credential: {
          ipfsCid: credential.ipfsCid,
          issuer: credential.issuer,
          subjectDid: credential.subjectDid,
          timestamp: credential.timestamp,
          revoked: credential.revoked
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async revokeCredential(credentialId) {
    try {
      await this.validateContractDeployment();
      const tx = await this.contract.revokeCredential(credentialId);
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateCredentialId(vcJwt) {
    // ethers v6: use top-level helpers (ethers.utils.* is undefined)
    return ethers.keccak256(ethers.toUtf8Bytes(vcJwt));
  }
}

export default new ContractService();