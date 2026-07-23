import { useEffect, useMemo, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { useAppState } from "../../../hooks";
import { useG$Amount } from "../../base/react";
import { SupportedChains } from "../../constants";
import { MPBBridgeReadOnlyUrls } from "../types";
import { useMPBBridgeContracts } from "./useMPBBridgeContracts";

const BALANCE_REFRESH_INTERVAL_MS = 60 * 1000;

type CachedBalance = {
  value: ethers.BigNumber;
  timestamp: number;
};

const balanceCache = new Map<string, CachedBalance>();
const balanceRequests = new Map<string, Promise<ethers.BigNumber>>();

/**
 * Preloads all supported balances so changing the source chain remains instant.
 * Unlike the previous block-based polling, this performs at most one read per
 * chain per minute and uses the MPB-specific read-only URLs.
 */
export const useMPBBridgeBalances = (readOnlyUrls?: MPBBridgeReadOnlyUrls) => {
  const { account } = useEthers();
  const { active } = useAppState();
  const [rawBalances, setRawBalances] = useState<Partial<Record<SupportedChains, ethers.BigNumber>>>({});

  const fuse = useMPBBridgeContracts(SupportedChains.FUSE, readOnlyUrls);
  const celo = useMPBBridgeContracts(SupportedChains.CELO, readOnlyUrls);
  const mainnet = useMPBBridgeContracts(SupportedChains.MAINNET, readOnlyUrls);
  const xdc = useMPBBridgeContracts(SupportedChains.XDC, readOnlyUrls);

  useEffect(() => {
    // Never show the previous wallet's cached values while the newly connected
    // account's four balances are loading.
    setRawBalances({});
  }, [/* used to clear balances when the connected wallet changes */ account]);

  useEffect(() => {
    let isMounted = true;

    if (!account) {
      return;
    }

    // Keep already loaded values visible while the app is backgrounded, but do
    // not run timers or issue RPC requests until it becomes active again.
    if (!active) {
      return;
    }

    const contracts = [
      [SupportedChains.FUSE, fuse.tokenContract],
      [SupportedChains.CELO, celo.tokenContract],
      [SupportedChains.MAINNET, mainnet.tokenContract],
      [SupportedChains.XDC, xdc.tokenContract]
    ] as const;

    const loadBalances = async () => {
      const updates: Partial<Record<SupportedChains, ethers.BigNumber>> = {};

      await Promise.all(
        contracts.map(async ([chainId, contract]) => {
          if (!contract) {
            return;
          }

          const cacheKey = `${account.toLowerCase()}:${chainId}`;
          const cached = balanceCache.get(cacheKey);

          if (cached && Date.now() - cached.timestamp < BALANCE_REFRESH_INTERVAL_MS) {
            updates[chainId] = cached.value;
            return;
          }

          try {
            // React strict mode and multiple mounted bridge views can start the
            // same four reads together. Share each account/chain request until
            // it settles so those mounts do not multiply RPC traffic.
            const existingRequest = balanceRequests.get(cacheKey);
            const request =
              existingRequest ||
              Promise.resolve(contract.balanceOf(account))
                .then((value: ethers.BigNumberish) => ethers.BigNumber.from(value))
                .finally(() => balanceRequests.delete(cacheKey));

            if (!existingRequest) {
              balanceRequests.set(cacheKey, request);
            }

            const value = await request;
            balanceCache.set(cacheKey, { value, timestamp: Date.now() });
            updates[chainId] = value;
          } catch {
            // A temporary failure on one chain must not hide balances already
            // loaded from the other chains. Keep stale data when it exists.
            if (cached) {
              updates[chainId] = cached.value;
            }
          }
        })
      );

      if (isMounted && Object.keys(updates).length > 0) {
        setRawBalances(previous => ({ ...previous, ...updates }));
      }
    };

    void loadBalances();
    const interval = setInterval(loadBalances, BALANCE_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [account, active, fuse.tokenContract, celo.tokenContract, mainnet.tokenContract, xdc.tokenContract]);

  const fuseBalance = useG$Amount(rawBalances[SupportedChains.FUSE], "G$", SupportedChains.FUSE);
  const celoBalance = useG$Amount(rawBalances[SupportedChains.CELO], "G$", SupportedChains.CELO);
  const mainnetBalance = useG$Amount(rawBalances[SupportedChains.MAINNET], "G$", SupportedChains.MAINNET);
  const xdcBalance = useG$Amount(rawBalances[SupportedChains.XDC], "G$", SupportedChains.XDC);

  return useMemo(
    () => ({
      balancesByChain: {
        fuse: fuseBalance,
        celo: celoBalance,
        mainnet: mainnetBalance,
        xdc: xdcBalance
      }
    }),
    [celoBalance, fuseBalance, mainnetBalance, xdcBalance]
  );
};
