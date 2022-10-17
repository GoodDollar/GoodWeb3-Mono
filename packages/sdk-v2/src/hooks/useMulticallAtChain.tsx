import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useConfig, Call, RawCall } from "@usedapp/core";
import { encodeCallData } from "@usedapp/core/dist/cjs/src/helpers";

import { JsonRpcProvider, BaseProvider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "ethers";
import { Result } from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";

const ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)"
];
const ABI2 = [
  "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public view returns (tuple(bool success, bytes returnData)[])"
];

export type CallsResult = Array<
  RawCall & {
    success: Boolean;
    value: string;
    decoded?: Result;
  }
>;

export async function multicall2(
  provider: Provider,
  address: string,
  blockNumber: number,
  requests: RawCall[]
): Promise<CallsResult> {
  if (requests.length === 0) {
    return [];
  }
  const contract = new Contract(address, ABI2, provider);
  const results: [boolean, string][] = await contract.tryAggregate(
    false,
    requests.map(({ address, data }) => [address, data]),
    { blockTag: blockNumber }
  );
  const state = requests.map((r, i) => {
    const { address, data } = r;
    const [success, value] = results[i];
    const result = { ...r, address, data, value, success };
    return result;
  });
  return state;
}

export async function multicall(
  provider: Provider,
  address: string,
  blockNumber: number,
  requests: RawCall[]
): Promise<CallsResult> {
  if (requests.length === 0) {
    return [];
  }
  const contract = new Contract(address, ABI, provider);
  const [, results]: [BigNumber, string[]] = await contract.aggregate(
    requests.map(({ address, data }) => [address, data]),
    { blockTag: blockNumber }
  );
  const state = requests.map((r, i) => {
    const { address, data } = r;
    const result = { ...r, address, data, value: results[i], success: true };
    return result;
  });
  return state;
}

export const useReadOnlyProvider = (chainId: number) => {
  const { readOnlyUrls, pollingInterval } = useConfig();

  const provider = useMemo<JsonRpcProvider | undefined>(() => {
    if (readOnlyUrls && readOnlyUrls[chainId]) {
      switch (true) {
        case readOnlyUrls[chainId] instanceof BaseProvider:
          return readOnlyUrls[chainId] as JsonRpcProvider;
        case typeof readOnlyUrls[chainId] === "function":
          return (readOnlyUrls[chainId] as any)() as JsonRpcProvider;
        default:
        case typeof readOnlyUrls[chainId] === "string":
          const provider = new JsonRpcProvider(readOnlyUrls[chainId] as any);
          provider.pollingInterval = pollingInterval;
          return provider;
      }
    }
  }, [readOnlyUrls, pollingInterval, chainId]);

  return provider;
};

/**
 * perform multicall requests to a specific chain using readonly rpcs from usedapp
 */
export const useMulticallAtChain = (chainId: number) => {
  const provider = useReadOnlyProvider(chainId);
  const { multicallVersion, multicallAddresses } = useConfig();
  const pendingCalls = useRef<{ resolve?: any; calls: Call[]; blockNumber?: number }>({ calls: [] });

  const _resolve = useCallback(
    async (calls: Call[], blockNumber?: number) => {
      const multiAddr =
        multicallAddresses && Object.entries(multicallAddresses).find(([k, v]) => k === String(chainId));
      if (provider && multiAddr) {
        // console.log({ provider, multiAddr, calls })
        const method = multicallVersion === 1 ? multicall : multicall2;
        const address = multiAddr[1];
        const rawcalls = calls.map(call => encodeCallData(call, chainId)).filter(Boolean) as RawCall[];
        const currentBlock = await provider.getBlockNumber();
        const results = await method(provider, address, blockNumber || currentBlock, rawcalls);
        results.forEach((r, i) => {
          const call = calls[i];
          r.decoded = call.contract.interface.decodeFunctionResult(call.method, r.value);
        });
        return results;
      }
    },
    [multicallAddresses, provider, multicallVersion, chainId]
  );

  const callMulti = useCallback(
    async (calls: Call[], blockNumber?: number) => {
      if (!provider) {
        const p = new Promise<CallsResult | undefined>((res, rej) => {
          pendingCalls.current.calls = pendingCalls.current.calls.concat(calls);
          pendingCalls.current.resolve = res;
          pendingCalls.current.blockNumber = blockNumber;
        });
        return p;
      }
      return _resolve(calls, blockNumber);
    },
    [provider]
  );

  /*
        this will handle the case if we got calls before we had a provider
    */
  useEffect(() => {
    if (provider && pendingCalls.current.calls.length > 0) {
      const calls = pendingCalls.current.calls;
      const resolve = pendingCalls.current.resolve;
      const bn = pendingCalls.current.blockNumber;
      pendingCalls.current = { calls: [] };
      _resolve(calls, bn).then(r => resolve(r));
    }
  }, [provider]);

  return callMulti;
};
