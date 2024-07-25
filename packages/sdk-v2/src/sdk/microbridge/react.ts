import { noop, sortBy } from "lodash";
import { BridgeSDK } from "@gooddollar/bridge-app/dist/sdk.js";
import TokenBridgeABI from "@gooddollar/bridge-contracts/artifacts/contracts/bridge/TokenBridge.sol/TokenBridge.json";
import bridgeContracts from "@gooddollar/bridge-contracts/release/deployment.json";
import { TokenBridge } from "@gooddollar/bridge-contracts/typechain-types";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { ChainId, TransactionStatus, useCalls, useEthers, useLogs } from "@usedapp/core";
import { BigNumber, Contract, ethers } from "ethers";
import { first, groupBy, mapValues } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSwitchNetwork } from "../../contexts";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGetContract, useGetEnvChainId } from "../base/react";
import { SupportedChains, formatAmount } from "../constants";
import { useContractFunctionWithDefaultGasFees } from "../base/hooks/useGasFees";

export const useGetBridgeContracts = () => {
  const { baseEnv } = useGetEnvChainId();
  const { fuseBridge, celoBridge } = bridgeContracts[baseEnv] || {};
  if (fuseBridge && celoBridge) {
    return {
      [SupportedChains.FUSE]: new Contract(fuseBridge, TokenBridgeABI.abi) as TokenBridge,
      [SupportedChains.CELO]: new Contract(celoBridge, TokenBridgeABI.abi) as TokenBridge
    };
  } else return {};
};

export const useWithinBridgeLimits = (requestChainId: number, account: string, amount: string) => {
  const bridgeContract = useGetBridgeContracts()[requestChainId];
  const canBridge = useCalls(
    [
      {
        contract: bridgeContract,
        method: "canBridge",
        args: [account, amount]
      }
    ].filter(() => bridgeContract && account && amount),
    {
      refresh: "never",
      chainId: requestChainId
    }
  );

  const [isValid = false, reason = ""]: [boolean, string] = canBridge?.[0]?.value || [];
  return { isValid, reason };
};

export type BridgeData = {
  bridgeFees: { minFee: BigNumber; maxFee: BigNumber; fee: BigNumber };
  bridgeLimits: { dailyLimit: BigNumber; txLimit: BigNumber; accountDailyLimit: BigNumber; minAmount: BigNumber };
  bridgeDailyLimit: { lastTransferReset: BigNumber; totalBridgedToday: BigNumber };
  accountDailyLimit: { lastTransferReset: BigNumber; totalBridgedToday: BigNumber };
};

export const useGetBridgeData = (requestChainId: number, account: string): BridgeData => {
  const bridgeContract = useGetBridgeContracts()[requestChainId] as TokenBridge;
  const results = useCalls(
    [
      {
        contract: bridgeContract,
        method: "bridgeFees",
        args: []
      },
      {
        contract: bridgeContract,
        method: "bridgeLimits",
        args: []
      },
      {
        contract: bridgeContract,
        method: "bridgeDailyLimit",
        args: []
      },
      account && {
        contract: bridgeContract,
        method: "accountsDailyLimit",
        args: [account]
      }
    ].filter(_ => _ && bridgeContract),
    {
      refresh: "never",
      chainId: requestChainId
    }
  );

  return {
    bridgeFees: results?.[0]?.value,
    bridgeLimits: results?.[1]?.value,
    bridgeDailyLimit: results?.[2]?.value,
    accountDailyLimit: results?.[3]?.value
  };
};

export const useBridge = (withRelay = false) => {
  const lock = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId } = useEthers();
  const gdFuseContract = useGetContract("GoodDollar", true, "base", 122) as IGoodDollar;
  const gdCeloContract = useGetContract("GoodDollar", true, "base", 42220) as IGoodDollar;
  const bridgeContracts = useGetBridgeContracts();
  const bridgeContract = bridgeContracts[chainId || 122] as TokenBridge;

  const relayTx = useRelayTx();

  const [bridgeRequest, setBridgeRequest] = useState<
    { amount: string; sourceChainId: number; targetChainId: number; target?: string; bridging?: boolean } | undefined
  >();

  const [selfRelayStatus, setSelfRelay] = useState<Partial<TransactionStatus> | undefined>();

  // const bridgeTo = useContractFunction(bridgeContract, "bridgeTo", {});
  const transferAndCall = useContractFunctionWithDefaultGasFees(
    chainId === 122 ? gdFuseContract : gdCeloContract,
    "transferAndCall",
    {
      transactionName: "BridgeTransfer"
    }
  );
  const bridgeRequestId = (transferAndCall.state?.receipt?.logs || [])
    .filter(log => log.address === bridgeContract.address)
    .map(log => bridgeContract.interface.parseLog(log))?.[0]?.args?.id;

  // poll target chain for transfer if bridgeRequestEvent was found
  const relayEvent = useLogs(
    bridgeRequest &&
      bridgeRequestId && {
        contract: bridgeContracts[bridgeRequest.targetChainId] ?? { address: ethers.constants.AddressZero },
        event: "ExecutedTransfer",
        args: [null, null, null, null, null, null, null, bridgeRequestId]
      },
    {
      refresh: useRefreshOrNever(bridgeRequestId ? 5 : "never"),
      chainId: bridgeRequest?.targetChainId,
      fromBlock: -1000
    }
  );

  const relayStatus: Partial<TransactionStatus> | undefined =
    relayEvent &&
    ({
      chainId: bridgeRequest?.targetChainId,
      status: relayEvent?.value?.length ? "Success" : "Mining",
      transaction: { hash: relayEvent?.value?.[0]?.transactionHash }
    } as TransactionStatus);

  const sendBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, target = account) => {
      setBridgeRequest(undefined);
      lock.current = false;
      transferAndCall.resetState();

      const targetChainId = sourceChain === "fuse" ? SupportedChains.CELO : SupportedChains.FUSE;
      const sourceChainId = sourceChain === "fuse" ? SupportedChains.FUSE : SupportedChains.CELO;

      await (async () => {
        if (sourceChainId !== chainId) {
          await switchNetwork(sourceChainId);
        }

        setBridgeRequest({ amount, sourceChainId, targetChainId, target });
      })().catch(noop);
    },
    [account, transferAndCall, chainId, switchNetwork]
  );

  // trigger the actual bridge request
  useEffect(() => {
    if (transferAndCall.state.status === "None" && bridgeRequest && account && !lock.current) {
      lock.current = true;
      const withoutRelay = !withRelay;
      // we use transfer and call to save the approve step
      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["uint256", "address", "bool"],
        [bridgeRequest.targetChainId, bridgeRequest.target || account, withoutRelay]
      );

      transferAndCall
        .send(bridgeContract.address, bridgeRequest.amount, encoded)
        .then(async sendTx => {
          if (sendTx && withRelay) {
            let relayTxHash = "";

            try {
              setSelfRelay({
                status: "None",
                transaction: {}
              } as TransactionStatus);
              const { relayTxHash: txHash = "", relayPromise } = await relayTx(
                chainId || 0,
                bridgeRequest.targetChainId,
                sendTx.transactionHash
              );
              relayTxHash = txHash;
              setSelfRelay({
                chainId: chainId,
                status: relayTxHash ? "Mining" : "Fail",
                transaction: { hash: relayTxHash }
              } as TransactionStatus);
              await relayPromise;
              setSelfRelay({
                status: "Success",
                chainId: chainId,
                transaction: { hash: relayTxHash }
              } as TransactionStatus);
            } catch (e: any) {
              console.log("transferAndCall catch:", { e });
              setSelfRelay({
                ...selfRelayStatus,
                status: "Exception",
                chainId: chainId,
                errorMessage: e.message,
                transaction: { hash: relayTxHash }
              } as TransactionStatus);
            }
          }
        })
        .catch(e => {
          throw e;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, bridgeContract, bridgeRequest, transferAndCall, lock]);

  return { sendBridgeRequest, bridgeRequestStatus: transferAndCall?.state, relayStatus, selfRelayStatus };
};

const delay = (millis: number) => {
  return new Promise(res => setTimeout(res, millis));
};

export const useRelayTx = () => {
  const contracts = useGetBridgeContracts();
  const { library, chainId } = useEthers();
  const { switchNetwork } = useSwitchNetwork();
  const { baseEnv } = useGetEnvChainId();

  const { registry = "0x44a1E0A83821E239F9Cef248CECc3AC5b910aeD2" } = bridgeContracts[baseEnv] || {};

  const signer = (library as ethers.providers.JsonRpcProvider)?.getSigner();
  const sdk = useMemo(
    () =>
      new BridgeSDK(
        registry,
        mapValues(contracts, _ => _?.address),
        50
      ),
    [contracts, registry]
  );
  const relayTx = useCallback(
    async (
      sourceChain: number,
      targetChain: number,
      txHash: string
    ): Promise<{ relayTxHash?: string; relayPromise?: Promise<any> }> => {
      let relayResult;
      while (!relayResult) {
        try {
          if (chainId !== targetChain) {
            await switchNetwork(targetChain);
          }
          const targetBalance = await signer.getBalance();

          if (targetBalance.lt(ethers.utils.parseEther("0.01"))) {
            throw new Error(`not enough balance for self relay: ${formatAmount(targetBalance, 18, 18)}`);
          }

          // todo-fix: library connected to different signer, signer is connected wallet here
          relayResult = await sdk.relayTx(sourceChain, targetChain, txHash, signer);

          return relayResult;
        } catch (e: any) {
          // console.log("useRelayTX:", { error: e });
          //retry if checkpoint still missing or txhash not found yet
          if (!e.message.includes("does not exists yet") && !e.message.includes("txhash/targetReceipt not found")) {
            throw e;
          } else {
            await delay(30000);
          }
        }
      }
      return {};
    },
    [sdk, signer, switchNetwork, chainId]
  );
  return relayTx;
};

export const useBridgeHistory = () => {
  const { account } = useEthers();
  const bridgeContracts = useGetBridgeContracts();
  const refresh = useRefreshOrNever(5);
  const fuseChainId = 122 as ChainId;
  const fuseOut = useLogs(
    {
      contract: bridgeContracts[122] as TokenBridge,
      event: "BridgeRequest",
      args: []
    },
    {
      chainId: fuseChainId,
      fromBlock: -2e4,
      refresh
    }
  );

  const fuseIn = useLogs(
    {
      contract: bridgeContracts[122] as TokenBridge,
      event: "ExecutedTransfer",
      args: []
    },
    {
      chainId: fuseChainId,
      fromBlock: -2e4,
      refresh
    }
  );

  const celoOut = useLogs(
    {
      contract: bridgeContracts[42220] as TokenBridge,
      event: "BridgeRequest",
      args: []
    },
    {
      chainId: 42220,
      fromBlock: -2e4,
      refresh
    }
  );

  const celoIn = useLogs(
    {
      contract: bridgeContracts[42220] as TokenBridge,
      event: "ExecutedTransfer",
      args: []
    },
    {
      chainId: 42220,
      fromBlock: -2e4,
      refresh
    }
  );

  if (!fuseOut || !fuseIn || !celoOut || !celoIn) {
    return {};
  }

  const celoExecuted = groupBy(celoIn?.value || [], _ => _.data.id);

  const fuseExecuted = groupBy(fuseIn?.value || [], _ => _.data.id);

  const fuseHistory = fuseOut?.value?.map(e => {
    type BridgeEvent = typeof e & { relayEvent: any; amount: string };
    const extended = e as BridgeEvent;
    extended.relayEvent = first(celoExecuted[e.data.id]);

    extended.amount = formatAmount(e.data.amount, 18); //amount is normalized to 18 decimals in the bridge
    return extended;
  });

  const celoHistory = celoOut?.value?.map(e => {
    type BridgeEvent = typeof e & { relayEvent: any; amount: string };
    const extended = e as BridgeEvent;
    extended.relayEvent = first(fuseExecuted[e.data.id]);
    extended.amount = formatAmount(e.data.amount, 18); //amount is normalized to 18 decimals in the bridge
    return extended;
  });

  const historyCombined = (fuseHistory || []).concat(celoHistory || []);

  const historyFiltered = historyCombined.filter(_ => _.data.from === account || _.data.to === account);
  const historySorted = sortBy(historyFiltered, _ => _.data.timestamp).reverse();

  return { fuseHistory, celoHistory, historySorted };
};
