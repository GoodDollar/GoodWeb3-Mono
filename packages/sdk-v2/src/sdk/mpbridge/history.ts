import { useEthers } from "@usedapp/core";
import { useRefreshOrNever } from "../../hooks";
import { useLogs, ChainId } from "@usedapp/core";
import { ethers } from "ethers";
import { first, groupBy, sortBy } from "lodash";
import { useGetMPBContracts } from "./hooks";

// Bridge history hook - Real implementation using blockchain events
export const useMPBBridgeHistory = () => {
  const { account } = useEthers();
  const mpbContracts = useGetMPBContracts();
  // const refresh = useRefreshOrNever(5);
  const fuseChainId = 122 as ChainId;
  const celoChainId = 42220 as ChainId;
  const mainnetChainId = 1 as ChainId;

  // Listen for BridgeRequest events on all chains with smaller block range to avoid RPC limits
  const fuseOut = useLogs(
    mpbContracts[122]
      ? {
          contract: mpbContracts[122],
          event: "BridgeRequest",
          args: []
        }
      : undefined,
    {
      chainId: fuseChainId,
      fromBlock: -1000, // Reduced from 20k to 1k blocks
      refresh: "never" // Disable auto-refresh to reduce RPC calls
    }
  );

  const fuseIn = useLogs(
    mpbContracts[122]
      ? {
          contract: mpbContracts[122],
          event: "ExecutedTransfer",
          args: []
        }
      : undefined,
    {
      chainId: fuseChainId,
      fromBlock: -1000,
      refresh: "never"
    }
  );

  const celoOut = useLogs(
    mpbContracts[42220]
      ? {
          contract: mpbContracts[42220],
          event: "BridgeRequest",
          args: []
        }
      : undefined,
    {
      chainId: celoChainId,
      fromBlock: -1000,
      refresh: "never"
    }
  );

  const celoIn = useLogs(
    mpbContracts[42220]
      ? {
          contract: mpbContracts[42220],
          event: "ExecutedTransfer",
          args: []
        }
      : undefined,
    {
      chainId: celoChainId,
      fromBlock: -1000,
      refresh: "never"
    }
  );

  const mainnetOut = useLogs(
    mpbContracts[1]
      ? {
          contract: mpbContracts[1],
          event: "BridgeRequest",
          args: []
        }
      : undefined,
    {
      chainId: mainnetChainId,
      fromBlock: -1000,
      refresh: "never"
    }
  );

  const mainnetIn = useLogs(
    mpbContracts[1]
      ? {
          contract: mpbContracts[1],
          event: "ExecutedTransfer",
          args: []
        }
      : undefined,
    {
      chainId: mainnetChainId,
      fromBlock: -1000,
      refresh: "never"
    }
  );

  if (!fuseOut || !fuseIn || !celoOut || !celoIn || !mainnetOut || !mainnetIn) {
    return { history: [], loading: true };
  }

  // Group executed transfers by ID for matching
  const fuseExecuted = groupBy(fuseIn?.value || [], _ => _?.data?.id);
  const celoExecuted = groupBy(celoIn?.value || [], _ => _?.data?.id);
  const mainnetExecuted = groupBy(mainnetIn?.value || [], _ => _?.data?.id);

  // Process Fuse bridge requests
  const fuseHistory = fuseOut?.value?.map(e => {
    const executedEvent = first(fuseExecuted[e.data.id]);
    const targetChain = e.data.targetChainId.toNumber();
    const bridgeService = e.data.bridge === 0 ? "LayerZero" : "Axelar";

    return {
      ...e,
      executedEvent,
      amount: ethers.utils.formatEther(e.data.amount),
      sourceChain: "Fuse",
      targetChain: targetChain === 122 ? "Fuse" : targetChain === 42220 ? "Celo" : "Mainnet",
      bridgeService,
      status: executedEvent ? "Completed" : "Pending",
      timestamp: e.data.timestamp || Date.now() / 1000
    };
  });

  // Process Celo bridge requests
  const celoHistory = celoOut?.value?.map(e => {
    const executedEvent = first(celoExecuted[e.data.id]);
    const targetChain = e.data.targetChainId.toNumber();
    const bridgeService = e.data.bridge === 0 ? "LayerZero" : "Axelar";

    return {
      ...e,
      executedEvent,
      amount: ethers.utils.formatEther(e.data.amount),
      sourceChain: "Celo",
      targetChain: targetChain === 122 ? "Fuse" : targetChain === 42220 ? "Celo" : "Mainnet",
      bridgeService,
      status: executedEvent ? "Completed" : "Pending",
      timestamp: e.data.timestamp || Date.now() / 1000
    };
  });

  // Process Mainnet bridge requests
  const mainnetHistory = mainnetOut?.value?.map(e => {
    const executedEvent = first(mainnetExecuted[e.data.id]);
    const targetChain = e.data.targetChainId.toNumber();
    const bridgeService = e.data.bridge === 0 ? "LayerZero" : "Axelar";

    return {
      ...e,
      executedEvent,
      amount: ethers.utils.formatEther(e.data.amount),
      sourceChain: "Mainnet",
      targetChain: targetChain === 122 ? "Fuse" : targetChain === 42220 ? "Celo" : "Mainnet",
      bridgeService,
      status: executedEvent ? "Completed" : "Pending",
      timestamp: e.data.timestamp || Date.now() / 1000
    };
  });

  // Combine all history
  const historyCombined = (fuseHistory || []).concat(celoHistory || []).concat(mainnetHistory || []);

  // Filter by account and sort by timestamp
  const historyFiltered = historyCombined.filter(_ => _?.data?.from === account || _?.data?.target === account);
  const historySorted = sortBy(historyFiltered, _ => _.timestamp).reverse();

  return {
    history: historySorted,
    loading: false,
    fuseHistory,
    celoHistory,
    mainnetHistory
  };
};

// Get detailed bridge status for a specific transaction
export const useMPBBridgeStatus = (txHash: string, sourceChainId: number, targetChainId: number) => {
  const mpbContracts = useGetMPBContracts();
  const refresh = useRefreshOrNever(5);

  // Listen for the bridge request event on source chain
  const bridgeRequestEvent = useLogs(
    {
      contract: mpbContracts[sourceChainId],
      event: "BridgeRequest",
      args: [null, null, null, null, null, null, null, null] // We'll filter by txHash
    },
    {
      chainId: sourceChainId,
      fromBlock: -2e4,
      refresh
    }
  );

  // Listen for the executed transfer event on target chain
  const executedTransferEvent = useLogs(
    {
      contract: mpbContracts[targetChainId],
      event: "ExecutedTransfer",
      args: [null, null, null, null, null, null, null, null] // We'll filter by bridge ID
    },
    {
      chainId: targetChainId,
      fromBlock: -2e4,
      refresh
    }
  );

  // Find the specific bridge request
  const bridgeRequest = bridgeRequestEvent?.value?.find(event => event.transactionHash === txHash);

  // Find the corresponding executed transfer
  const executedTransfer = executedTransferEvent?.value?.find(event => event.data.id === bridgeRequest?.data?.id);

  // Determine status
  let status = "Pending";
  if (bridgeRequest && executedTransfer) {
    status = "Completed";
  } else if (bridgeRequest) {
    status = "In Progress";
  }

  return {
    status,
    bridgeRequest,
    executedTransfer,
    bridgeId: bridgeRequest?.data?.id,
    amount: bridgeRequest?.data?.amount ? ethers.utils.formatEther(bridgeRequest.data.amount) : "0",
    sourceChain: sourceChainId === 122 ? "Fuse" : sourceChainId === 42220 ? "Celo" : "Mainnet",
    targetChain: targetChainId === 122 ? "Fuse" : targetChainId === 42220 ? "Celo" : "Mainnet",
    bridgeService: bridgeRequest?.data?.bridge === 0 ? "LayerZero" : "Axelar"
  };
};
