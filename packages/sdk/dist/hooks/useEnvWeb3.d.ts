import Web3 from 'web3';
import { SupportedChainId, DAO_NETWORK } from 'constants/chains';
export declare const RPC: {
    1: any;
    3: any;
    42: any;
    122: string;
};
/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export declare const useEnvWeb3: (dao: DAO_NETWORK, activeWeb3?: any | undefined, activeChainId?: number) => [Web3 | null, SupportedChainId];
//# sourceMappingURL=useEnvWeb3.d.ts.map