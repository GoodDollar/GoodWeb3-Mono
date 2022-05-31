import React from 'react';
import Web3 from 'web3';
export interface GdSdkContextInterface {
    web3: Web3 | null;
    activeNetwork: string;
}
declare const GdSdkContext: React.Context<GdSdkContextInterface>;
export declare function useGdContextProvider(): GdSdkContextInterface;
export default GdSdkContext;
//# sourceMappingURL=useGdSdkContext.d.ts.map