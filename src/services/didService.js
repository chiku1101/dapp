import { EthrDID } from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

class DIDService {
  constructor() {
    this.resolver = new Resolver(getResolver({
      networks: [
        {
          name: 'sepolia',
          rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          registry: '0x03d5003bf0e79C5F5223588F347ebA39AfbC3818'
        }
      ]
    }));
  }

  async createDID(signer) {
    try {
      if (!signer || typeof signer.getAddress !== 'function') {
        throw new Error('A valid ethers signer is required to create a DID.');
      }
      const address = await signer.getAddress();

      const ethrDid = new EthrDID({
        identifier: address,
        provider: signer.provider,
        chainNameOrId: 'sepolia',
      });
      // Attach the signer to the instance for consistency.
      ethrDid.signer = signer;

      return {
        success: true,
        did: ethrDid.did,
        ethrDid: ethrDid // Return the fully configured instance
      };
    } catch (error) {
      console.error('CreateDID Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async resolveDID(did) {
    try {
      const didDocument = await this.resolver.resolve(did);
      return {
        success: true,
        didDocument
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateDIDFromAddress(address) {
    return `did:ethr:sepolia:${address}`;
  }
}

export default new DIDService();