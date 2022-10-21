import { ethers } from "ethers";
declare const useEthers: () => {
    activate: (provider: ethers.providers.JsonRpcProvider | ethers.providers.ExternalProvider | {
        getProvider: () => any;
        activate: () => Promise<any>;
    }) => Promise<void>;
    setError: (error: Error) => void;
    deactivate: () => void;
    connector: undefined;
    chainId?: number | undefined;
    account?: string | undefined;
    error?: Error | undefined;
    active: boolean;
    activateBrowserWallet: () => void;
    isLoading: boolean;
    switchNetwork: (chainId: number) => Promise<void>;
    isWeb3: boolean;
    library: ethers.providers.JsonRpcProvider | undefined;
};
export default useEthers;
//# sourceMappingURL=useEthers.d.ts.map