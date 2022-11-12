import { Call, RawCall } from "@usedapp/core";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Result } from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";
export declare type CallsResult = Array<RawCall & {
    success: Boolean;
    value: string;
    decoded?: Result;
}>;
export declare function multicall2(provider: Provider, address: string, blockNumber: number, requests: RawCall[]): Promise<CallsResult>;
export declare function multicall(provider: Provider, address: string, blockNumber: number, requests: RawCall[]): Promise<CallsResult>;
export declare const useReadOnlyProvider: (chainId: number) => JsonRpcProvider | undefined;
export declare function validateCall(call: Call): Call;
export declare const useMulticallAtChain: (chainId: number) => (calls: Call[], blockNumber?: number) => Promise<CallsResult | undefined>;
//# sourceMappingURL=useMulticallAtChain.d.ts.map