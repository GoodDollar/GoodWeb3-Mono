import { noop, sortBy } from "lodash";
import { BigNumber, Contract, ethers } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import { TransactionStatus, useCalls, useEthers, useLogs } from "@usedapp/core";

import { useSwitchNetwork } from "../../contexts";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { SupportedChains, formatAmount } from "../constants";
import { useContractFunctionWithDefaultGasFees } from "../base/hooks/useGasFees";

// MPB Contract ABI - this would need to be updated with actual MPB contract ABI
const MPBBridgeABI = [
  "function bridgeTo(uint256 destinationChainId, address recipient, uint256 amount, bytes calldata adapterParams) external payable",
  "function quoteFee(uint256 destinationChainId, bytes calldata adapterParams) external view returns (uint256 nativeFee, uint256 zroFee)",
  "function estimateSendFee(uint256 destinationChainId, address recipient, uint256 amount, bool payInLZToken, bytes calldata adapterParams) external view returns (uint256 nativeFee, uint256 zroFee)",
  "event BridgeRequest(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed sender, address recipient, uint256 amount, uint256 fee)",
  "event BridgeCompleted(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed recipient, uint256 amount)"
];

// MPB Contract addresses - these would need to be updated with actual addresses
const MPB_CONTRACTS = {
  [SupportedChains.FUSE]: "0x0000000000000000000000000000000000000000", // Replace with actual address
  [SupportedChains.CELO]: "0x0000000000000000000000000000000000000000", // Replace with actual address
  [SupportedChains.MAINNET]: "0x0000000000000000000000000000000000000000" // Replace with actual address
};

export const useGetMPBContracts = () => {
  return {
    [SupportedChains.FUSE]: new Contract(MPB_CONTRACTS[SupportedChains.FUSE], MPBBridgeABI) as Contract,
    [SupportedChains.CELO]: new Contract(MPB_CONTRACTS[SupportedChains.CELO], MPBBridgeABI) as Contract,
    [SupportedChains.MAINNET]: new Contract(MPB_CONTRACTS[SupportedChains.MAINNET], MPBBridgeABI) as Contract
  };
};

export const useMPBBridgeLimits = (requestChainId: number, _account: string, amount: string) => {
  const mpbContract = useGetMPBContracts()[requestChainId];

  // For MPB, we'll implement basic validation
  // In a real implementation, this would call contract methods to check limits
  useCalls(
    [
      {
        contract: mpbContract,
        method: "quoteFee",
        args: [requestChainId === SupportedChains.FUSE ? SupportedChains.CELO : SupportedChains.FUSE, "0x"]
      }
    ].filter(() => mpbContract && _account && amount),
    {
      refresh: "never",
      chainId: requestChainId
    }
  );

  // Basic validation - in real implementation this would check actual contract limits
  const isValid = amount && BigNumber.from(amount).gt(0);
  const reason = isValid ? "" : "Invalid amount";

  return { isValid, reason };
};

export type MPBBridgeData = {
  bridgeFees: { nativeFee: BigNumber; zroFee: BigNumber };
  bridgeLimits: { minAmount: BigNumber; maxAmount: BigNumber };
};

export const useGetMPBBridgeData = (requestChainId: number, account: string): MPBBridgeData => {
  const mpbContract = useGetMPBContracts()[requestChainId];

  useCalls(
    [
      {
        contract: mpbContract,
        method: "quoteFee",
        args: [requestChainId === SupportedChains.FUSE ? SupportedChains.CELO : SupportedChains.FUSE, "0x"]
      }
    ].filter(_ => _ && mpbContract && account),
    {
      refresh: "never",
      chainId: requestChainId
    }
  );

  return {
    bridgeFees: { nativeFee: BigNumber.from(0), zroFee: BigNumber.from(0) },
    bridgeLimits: {
      minAmount: BigNumber.from("1000000000000000000"),
      maxAmount: BigNumber.from("1000000000000000000000000")
    } // 1 G$ to 1M G$
  };
};

export const useMPBBridge = () => {
  const lock = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId } = useEthers();
  const mpbContracts = useGetMPBContracts();
  const mpbContract = mpbContracts[chainId || 122];

  const [bridgeRequest, setBridgeRequest] = useState<
    { amount: string; sourceChainId: number; targetChainId: number; target?: string; bridging?: boolean } | undefined
  >();

  const bridgeTo = useContractFunctionWithDefaultGasFees(mpbContract, "bridgeTo", {
    transactionName: "MPBBridgeTransfer"
  });

  const bridgeRequestId = (bridgeTo.state?.receipt?.logs || [])
    .filter(log => log.address === mpbContract?.address)
    .map(log => mpbContract?.interface.parseLog(log))?.[0]?.args?.id;

  // Poll target chain for bridge completion
  const bridgeCompletedEvent = useLogs(
    bridgeRequest &&
      bridgeRequestId && {
        contract: mpbContracts[bridgeRequest.targetChainId] ?? { address: ethers.constants.AddressZero },
        event: "BridgeCompleted",
        args: [null, null, null, bridgeRequestId]
      },
    {
      refresh: useRefreshOrNever(bridgeRequestId ? 5 : "never"),
      chainId: bridgeRequest?.targetChainId,
      fromBlock: -1000
    }
  );

  const bridgeStatus: Partial<TransactionStatus> | undefined =
    bridgeCompletedEvent &&
    ({
      chainId: bridgeRequest?.targetChainId,
      status: bridgeCompletedEvent?.value?.length ? "Success" : "Mining",
      transaction: { hash: bridgeCompletedEvent?.value?.[0]?.transactionHash }
    } as TransactionStatus);

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, target = account) => {
      setBridgeRequest(undefined);
      lock.current = false;
      bridgeTo.resetState();

      const targetChainId =
        sourceChain === "fuse"
          ? SupportedChains.CELO
          : sourceChain === "celo"
          ? SupportedChains.MAINNET
          : SupportedChains.FUSE;
      const sourceChainId =
        sourceChain === "fuse"
          ? SupportedChains.FUSE
          : sourceChain === "celo"
          ? SupportedChains.CELO
          : SupportedChains.MAINNET;

      await (async () => {
        if (sourceChainId !== chainId) {
          await switchNetwork(sourceChainId);
        }

        setBridgeRequest({ amount, sourceChainId, targetChainId, target });
      })().catch(noop);
    },
    [account, bridgeTo, chainId, switchNetwork]
  );

  // Trigger the actual bridge request
  useEffect(() => {
    if (bridgeTo.state.status === "None" && bridgeRequest && account && !lock.current) {
      lock.current = true;

      // Get fee estimate
      void mpbContract
        ?.estimateSendFee(
          bridgeRequest.targetChainId,
          bridgeRequest.target || account,
          bridgeRequest.amount,
          false, // payInLZToken
          "0x" // adapterParams
        )
        .then(([nativeFee]) => {
          // Send bridge transaction with fee
          void bridgeTo.send(
            bridgeRequest.targetChainId,
            bridgeRequest.target || account,
            bridgeRequest.amount,
            "0x", // adapterParams
            { value: nativeFee }
          );
        })
        .catch(e => {
          console.error("MPB Bridge error:", e);
          throw e;
        });
    }
  }, [bridgeTo, bridgeRequest, account, mpbContract]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: bridgeTo.state,
    bridgeStatus
  };
};

export const useMPBBridgeHistory = () => {
  const mpbContracts = useGetMPBContracts();
  const refresh = useRefreshOrNever(5);

  const fuseOut = useLogs(
    {
      contract: mpbContracts[122],
      event: "BridgeRequest",
      args: []
    },
    {
      chainId: 122 as any,
      fromBlock: -2e4,
      refresh
    }
  );

  const celoOut = useLogs(
    {
      contract: mpbContracts[42220],
      event: "BridgeRequest",
      args: []
    },
    {
      chainId: 42220 as any,
      fromBlock: -2e4,
      refresh
    }
  );

  const mainnetOut = useLogs(
    {
      contract: mpbContracts[1],
      event: "BridgeRequest",
      args: []
    },
    {
      chainId: 1 as any,
      fromBlock: -2e4,
      refresh
    }
  );

  if (!fuseOut || !celoOut || !mainnetOut) {
    return {};
  }

  const fuseHistory = fuseOut?.value?.map(e => ({
    ...e,
    amount: formatAmount(e.data.amount, 18),
    sourceChain: "Fuse",
    targetChain: "Celo",
    bridgeProvider: "axelar", // Fuse typically uses Axelar
    chainId: 122
  }));

  const celoHistory = celoOut?.value?.map(e => ({
    ...e,
    amount: formatAmount(e.data.amount, 18),
    sourceChain: "Celo",
    targetChain: "Mainnet",
    bridgeProvider: "layerzero", // Celo typically uses LayerZero
    chainId: 42220
  }));

  const mainnetHistory = mainnetOut?.value?.map(e => ({
    ...e,
    amount: formatAmount(e.data.amount, 18),
    sourceChain: "Mainnet",
    targetChain: "Fuse",
    bridgeProvider: "axelar", // Mainnet typically uses Axelar
    chainId: 1
  }));

  const historySorted = sortBy(
    [...(fuseHistory || []), ...(celoHistory || []), ...(mainnetHistory || [])],
    "blockNumber"
  ).reverse();

  return { historySorted };
};

// LayerZero/Axelar explorer links
export const getLayerZeroExplorerLink = (txHash: string, chainId: number) => {
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : "celo";
  return `https://layerzeroscan.com/${chainName}/tx/${txHash}`;
};

export const getAxelarExplorerLink = (txHash: string, chainId: number) => {
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : "celo";
  return `https://axelarscan.io/${chainName}/tx/${txHash}`;
};
