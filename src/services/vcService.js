import { createVerifiableCredentialJwt, verifyCredential } from 'did-jwt-vc';
import { EthrDID } from 'ethr-did';
import walletService from './walletService';
import contractService from './contractService';
import ipfsService from './ipfsService';
import didService from './didService';
import { ethers } from 'ethers';

class VCService {
  async createVC(issuerDID, subjectDID, credentialSubject, signer) {
    try {
      if (!signer || typeof signer.getAddress !== 'function') {
        throw new Error('A valid ethers signer is required to create a Verifiable Credential.');
      }
      const address = await signer.getAddress();

      // We still need EthrDID to get the correct DID format.
      const ethrDid = new EthrDID({
        identifier: address,
        provider: signer.provider,
        chainNameOrId: 'sepolia',
      });

      const vcPayload = {
        sub: subjectDID,
        nbf: Math.floor(Date.now() / 1000),
        vc: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          credentialSubject: {
            id: subjectDID,
            ...credentialSubject
          }
        }
      };

      // Convert 0x-hex -> bytes
      const hexToBytes = (hex) => {
        if (!hex) return new Uint8Array();
        let s = hex.startsWith('0x') ? hex.slice(2) : hex;
        if (s.length % 2 !== 0) s = '0' + s;
        const out = new Uint8Array(s.length / 2);
        for (let i = 0; i < out.length; i++) {
          out[i] = parseInt(s.substr(i * 2, 2), 16);
        }
        return out;
      };

      // bytes -> base64url
      const bytesToBase64url = (bytes) => {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const b64 = btoa(binary);
        return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      };

      // Provide signer that returns base64url-encoded raw signature bytes (not 0x-hex)
      const issuer = {
        did: issuerDID,
        alg: 'ES256K-R',
        signer: async (data) => {
          const sigHex = await signer.signMessage(data); // 0x... hex string
          const sigBytes = hexToBytes(sigHex);           // Uint8Array of 64 or 65 bytes
          if (sigBytes.length !== 64 && sigBytes.length !== 65) {
            console.warn('Unexpected signature byte length:', sigBytes.length);
          }
          return bytesToBase64url(sigBytes);             // did-jwt expects base64url
        },
      };

      const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer);

      return {
        success: true,
        vcJwt,
        vcPayload
      };
    } catch (error) {
      console.error('CreateVC Error:', error);
      return {
        success: false,
        error: `Failed to create VC: ${error.message}`
      };
    }
  }

  async verifyVC(vcJwt, resolver) {
    try {
      const verifiedVC = await verifyCredential(vcJwt, resolver);
      return {
        success: true,
        verifiedVC
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async issueCredential(credentialData) {
    try {
      // First, check if wallet is connected
      if (!walletService.isConnected()) {
        return {
          success: false,
          error: 'Please connect your wallet first to issue credentials'
        };
      }

      const signer = walletService.getSigner();
      if (!signer) {
        return {
          success: false,
          error: 'Wallet signer not available. Please reconnect your wallet'
        };
      }

      // Verify signer has required methods
      if (!signer.getAddress || !signer.provider) {
        return {
          success: false,
          error: 'Invalid signer configuration. Please reconnect your wallet'
        };
      }

      // Initialize contract service
      contractService.initialize(null, signer);

      // Create issuer DID
      const issuerResult = await didService.createDID(signer);
      if (!issuerResult.success) {
        return {
          success: false,
          error: 'Failed to create issuer DID: ' + issuerResult.error
        };
      }

      // Create the verifiable credential with proper signer
      const vcResult = await this.createVC(
        issuerResult.did,
        credentialData.subject,
        credentialData.claims,
        signer
      );

      if (!vcResult.success) {
        return {
          success: false,
          error: 'Failed to create VC: ' + vcResult.error
        };
      }

      // Upload to IPFS
      const ipfsResult = await ipfsService.uploadVC({
        vcJwt: vcResult.vcJwt,
        vcPayload: vcResult.vcPayload,
        type: credentialData.type,
        issuedAt: new Date().toISOString()
      });

      if (!ipfsResult.success) {
        return {
          success: false,
          error: 'Failed to upload to IPFS: ' + ipfsResult.error
        };
      }

      // Generate credential ID
      const credentialId = contractService.generateCredentialId(vcResult.vcJwt);

      // Store on blockchain
      const contractResult = await contractService.issueCredential(
        credentialId,
        ipfsResult.cid,
        credentialData.subject
      );

      if (!contractResult.success) {
        return {
          success: false,
          error: 'Failed to store on blockchain: ' + contractResult.error
        };
      }

      return {
        success: true,
        credentialId: credentialId,
        vcJwt: vcResult.vcJwt,
        ipfsCid: ipfsResult.cid,
        transactionHash: contractResult.transactionHash
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyCredential(credentialId) {
    try {
      // Check if wallet is connected for blockchain operations
      if (!walletService.isConnected()) {
        return {
          success: false,
          error: 'Please connect your wallet first to verify credentials'
        };
      }

      const signer = walletService.getSigner();
      if (!signer) {
        return {
          success: false,
          error: 'Wallet signer not available. Please reconnect your wallet'
        };
      }

      // Initialize contract service
      contractService.initialize(null, signer);

      // Get credential from blockchain
      const contractResult = await contractService.getCredential(credentialId);
      if (!contractResult.success) {
        return {
          success: false,
          error: 'Credential not found on blockchain: ' + contractResult.error
        };
      }

      const credential = contractResult.credential;
      
      // Check if revoked
      if (credential.revoked) {
        return {
          success: false,
          error: 'Credential has been revoked'
        };
      }

      // Download from IPFS
      const ipfsResult = await ipfsService.downloadVC(credential.ipfsCid);
      if (!ipfsResult.success) {
        return {
          success: false,
          error: 'Failed to download from IPFS: ' + ipfsResult.error
        };
      }

      // Verify the JWT
      const verifyResult = await this.verifyVC(ipfsResult.vcData.vcJwt, didService.resolver);
      if (!verifyResult.success) {
        return {
          success: false,
          error: 'JWT verification failed: ' + verifyResult.error
        };
      }

      return {
        success: true,
        credential: {
          id: credentialId,
          type: ipfsResult.vcData.type,
          subject: credential.subjectDid,
          issuer: credential.issuer,
          issuedAt: ipfsResult.vcData.issuedAt,
          timestamp: credential.timestamp,
          verified: true,
          vcData: ipfsResult.vcData
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add revocation functionality
  async revokeCredential(credentialId) {
    try {
      if (!walletService.isConnected()) {
        return {
          success: false,
          error: 'Please connect your wallet first to revoke credentials'
        };
      }

      const signer = walletService.getSigner();
      if (!signer) {
        return {
          success: false,
          error: 'Wallet signer not available. Please reconnect your wallet'
        };
      }

      contractService.initialize(null, signer);

      const result = await contractService.revokeCredential(credentialId);
      if (!result.success) {
        return {
          success: false,
          error: 'Failed to revoke credential: ' + result.error
        };
      }

      return {
        success: true,
        transactionHash: result.transactionHash
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add batch operations
  async issueMultipleCredentials(credentialsData) {
    try {
      if (!Array.isArray(credentialsData) || credentialsData.length === 0) {
        return {
          success: false,
          error: 'Invalid credentials data. Expected non-empty array.'
        };
      }

      const results = [];
      for (const credentialData of credentialsData) {
        const result = await this.issueCredential(credentialData);
        results.push({
          ...result,
          inputData: credentialData
        });
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: true,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        },
        results: results
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add credential search functionality
  async getCredentialsBySubject(subjectDID) {
    try {
      if (!walletService.isConnected()) {
        return {
          success: false,
          error: 'Please connect your wallet first'
        };
      }

      const signer = walletService.getSigner();
      if (!signer) {
        return {
          success: false,
          error: 'Wallet signer not available'
        };
      }

      contractService.initialize(null, signer);

      const result = await contractService.getCredentialsBySubject(subjectDID);
      if (!result.success) {
        return {
          success: false,
          error: 'Failed to retrieve credentials: ' + result.error
        };
      }

      return {
        success: true,
        credentials: result.credentials
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Utility method for credential validation
  validateCredentialData(credentialData) {
    const errors = [];

    if (!credentialData) {
      errors.push('Credential data is required');
      return { isValid: false, errors };
    }

    if (!credentialData.subject) {
      errors.push('Subject DID is required');
    }

    if (!credentialData.type) {
      errors.push('Credential type is required');
    }

    if (!credentialData.claims || Object.keys(credentialData.claims).length === 0) {
      errors.push('Credential claims are required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export default new VCService();