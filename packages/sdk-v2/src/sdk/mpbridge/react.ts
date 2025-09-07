import { useCallback, useEffect, useRef, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useSwitchNetwork } from "../../contexts";
import { useRefreshOrNever } from "../../hooks";
import { useLogs, ChainId } from "@usedapp/core";
import { ethers } from "ethers";
import { SupportedChains } from "../constants";
import { TransactionStatus } from "@usedapp/core";
import { useGetContract } from "../base/react";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { first, groupBy, sortBy } from "lodash";

// GoodDollar Bridge API functions
export const fetchBridgeFees = async () => {
  try {
    const response = await fetch("https://goodserver.gooddollar.org/bridge/estimatefees");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching bridge fees:", error);
    return null;
  }
};

// Old getBridgeFee function removed - using inline fee parsing logic

// Helper function to convert fee to wei based on currency
export const convertFeeToWei = (fee: string, currency: string): string => {
  const feeValue = parseFloat(fee);

  switch (currency.toLowerCase()) {
    case "eth":
      return ethers.utils.parseEther(feeValue.toString()).toString();
    case "celo":
      return ethers.utils.parseEther(feeValue.toString()).toString();
    case "fuse":
      return ethers.utils.parseEther(feeValue.toString()).toString();
    default:
      return ethers.utils.parseEther(feeValue.toString()).toString();
  }
};

// MPB Contract ABI - Updated with actual contract ABI from mpb.json
const MPBBridgeABI = [
  "function bridgeTo(address target, uint256 targetChainId, uint256 amount, uint8 bridge) external payable",
  "function bridgeLimits() external view returns (tuple(uint256 dailyLimit, uint256 txLimit, uint256 accountDailyLimit, uint256 minAmount, bool onlyWhitelisted))",
  "function canBridge(address from, uint256 amount) external view returns (bool)",
  "event BridgeRequest(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed sender, address target, uint256 amount, uint8 bridge, uint256 id)",
  "event ExecutedTransfer(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed target, uint256 amount, uint8 bridge, uint256 id)"
];

// Bridge Service enum values (LayerZero = 0, Axelar = 1)
export enum BridgeService {
  LAYERZERO = 0,
  AXELAR = 1
}

// MPB Contract addresses - Updated with actual deployed addresses from deployment.json
const MPB_CONTRACTS = {
  [SupportedChains.FUSE]: "0x5B7cEfD0e7d952F7E400416F9c98fE36F1043822", // Fuse bridge
  [SupportedChains.CELO]: "0x165aEb4184A0cc4eFb96Cb6035341Ba2265bA564", // Celo bridge
  [SupportedChains.MAINNET]: "0x08fdf766694C353401350c225cAEB9C631dC3288" // Mainnet bridge
};

export const useGetMPBContracts = () => {
  const { library } = useEthers();

  return {
    [SupportedChains.FUSE]: library
      ? (new ethers.Contract(MPB_CONTRACTS[SupportedChains.FUSE], MPBBridgeABI, library) as ethers.Contract)
      : null,
    [SupportedChains.CELO]: library
      ? (new ethers.Contract(MPB_CONTRACTS[SupportedChains.CELO], MPBBridgeABI, library) as ethers.Contract)
      : null,
    [SupportedChains.MAINNET]: library
      ? (new ethers.Contract(MPB_CONTRACTS[SupportedChains.MAINNET], MPBBridgeABI, library) as ethers.Contract)
      : null
  };
};

export const useMPBBridgeLimits = (amount: string, chainId?: number) => {
  const { account } = useEthers();
  const mpbContracts = useGetMPBContracts();
  const contract = mpbContracts[chainId || 122];

  const [limits, setLimits] = useState<{
    dailyLimit: ethers.BigNumber;
    txLimit: ethers.BigNumber;
    accountDailyLimit: ethers.BigNumber;
    minAmount: ethers.BigNumber;
    onlyWhitelisted: boolean;
  } | null>(null);

  const [canBridge, setCanBridge] = useState<boolean>(true); // Default to true
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start with false for immediate validation

  useEffect(() => {
    if (contract && account) {
      setIsLoading(true);

      // Get bridge limits from contract
      contract
        .bridgeLimits()
        .then((bridgeLimits: any) => {
          setLimits({
            dailyLimit: bridgeLimits.dailyLimit,
            txLimit: bridgeLimits.txLimit,
            accountDailyLimit: bridgeLimits.accountDailyLimit,
            minAmount: bridgeLimits.minAmount,
            onlyWhitelisted: bridgeLimits.onlyWhitelisted
          });
        })
        .catch(error => {
          console.error("Error getting bridge limits:", error);
          // Set fallback limits if contract call fails
          setLimits({
            dailyLimit: ethers.BigNumber.from("1000000000000000000000000"), // 1M G$
            txLimit: ethers.BigNumber.from("1000000000000000000000000"), // 1M G$
            accountDailyLimit: ethers.BigNumber.from("1000000000000000000000000"), // 1M G$
            minAmount: ethers.BigNumber.from("1000000000000000000"), // 1 G$
            onlyWhitelisted: false
          });
        });

      // Check if user can bridge this amount
      const amountBN = ethers.BigNumber.from(amount || "0");
      if (amountBN.gt(0) && contract) {
        contract
          .canBridge(account, amountBN)
          .then(result => {
            setCanBridge(result);
          })
          .catch(error => {
            console.error("Error checking canBridge:", error);
            setCanBridge(true); // Default to true if check fails
          });
      } else if (!contract) {
        console.error("Bridge contract is null - cannot check canBridge");
        setCanBridge(true); // Default to true if contract is null
      }

      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [contract, account, amount]);

  const amountBN = ethers.BigNumber.from(amount || "0");

  // Always do basic validation first (immediate response)
  const minAmount = ethers.BigNumber.from("1000000000000000000"); // 1 G$
  const maxAmount = ethers.BigNumber.from("1000000000000000000000000"); // 1M G$

  // Validation in progress

  if (amountBN.lt(minAmount)) {
    return { isValid: false, reason: "minAmount" };
  }
  if (amountBN.gt(maxAmount)) {
    return { isValid: false, reason: "maxAmount" };
  }

  // If still loading contract data, return valid for now
  if (isLoading) {
    return { isValid: true, reason: "" };
  }

  // If no limits loaded from contract, use fallback validation (already passed basic validation above)
  if (!limits) {
    return { isValid: true, reason: "" };
  }

  // Use contract limits for validation
  if (amountBN.lt(limits.minAmount)) {
    return { isValid: false, reason: "minAmount" };
  }

  if (amountBN.gt(limits.txLimit)) {
    return { isValid: false, reason: "maxAmount" };
  }

  if (!canBridge) {
    return { isValid: false, reason: "cannotBridge" };
  }

  return { isValid: true, reason: "" };
};

export type MPBBridgeData = {
  bridgeFees: { nativeFee: ethers.BigNumber; zroFee: ethers.BigNumber };
  bridgeLimits: { minAmount: ethers.BigNumber; maxAmount: ethers.BigNumber };
};

export const useGetMPBBridgeData = (): MPBBridgeData => {
  // In a real implementation, this would fetch data from the contracts
  // For now, we'll return default values
  return {
    bridgeFees: {
      nativeFee: ethers.BigNumber.from("100000000000000000"), // 0.1 ETH default
      zroFee: ethers.BigNumber.from(0)
    },
    bridgeLimits: {
      minAmount: ethers.BigNumber.from("1000000000000000000"), // 1 G$
      maxAmount: ethers.BigNumber.from("1000000000000000000000000") // 1M G$
    }
  };
};

export const useMPBBridge = (bridgeProvider: "layerzero" | "axelar" = "axelar") => {
  const lock = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId } = useEthers();
  const mpbContracts = useGetMPBContracts();

  const [bridgeRequest, setBridgeRequest] = useState<
    { amount: string; sourceChainId: number; targetChainId: number; target?: string; bridging?: boolean } | undefined
  >();

  // Get G$ token contract for the current chain
  const gdContract = useGetContract("GoodDollar", true, "base", chainId) as IGoodDollar;

  // Use direct bridgeTo call on the bridge contract to properly handle native fees
  const bridgeContract = mpbContracts[chainId || 122];
  const bridgeTo = useContractFunction(bridgeContract, "bridgeTo", {
    transactionName: "MPBBridgeTransfer"
  });

  // Bridge contract initialized

  // Use approve for G$ tokens if needed
  const approve = useContractFunction(gdContract, "approve", {
    transactionName: "ApproveG$ForBridge"
  });

  const bridgeRequestId = (bridgeTo.state?.receipt?.logs || [])
    .filter(log => log.address === bridgeContract?.address)
    .map(log => bridgeContract?.interface.parseLog(log))?.[0]?.args?.id;

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

  // Bridge status based on local transaction status and bridge completion
  const bridgeStatus: Partial<TransactionStatus> | undefined = (() => {
    if (bridgeTo.state.status === "Mining" || bridgeTo.state.status === "PendingSignature") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: bridgeTo.state.status,
        transaction: bridgeTo.state.transaction
      } as TransactionStatus;
    }

    if (bridgeTo.state.status === "Success" && bridgeCompletedEvent?.value?.length) {
      return {
        chainId: bridgeRequest?.targetChainId,
        status: "Success",
        transaction: { hash: bridgeCompletedEvent.value[0].transactionHash }
      } as TransactionStatus;
    }

    if (bridgeTo.state.status === "Exception") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: bridgeTo.state.errorMessage
      } as TransactionStatus;
    }

    return undefined;
  })();

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, targetChain: string, target = account) => {
      setBridgeRequest(undefined);
      lock.current = false;
      bridgeTo.resetState();
      approve.resetState();

      const targetChainId =
        targetChain === "fuse"
          ? SupportedChains.FUSE
          : targetChain === "celo"
          ? SupportedChains.CELO
          : SupportedChains.MAINNET;
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
      })().catch(e => {
        console.error("MPB Bridge error:", e);
        throw e;
      });
    },
    [account, bridgeTo, approve, chainId, switchNetwork]
  );

  // Trigger the approval first
  useEffect(() => {
    if (approve.state.status === "None" && bridgeRequest && account && !lock.current) {
      lock.current = true;

      console.log("🔐 Starting approval process...");

      // First approve G$ tokens for the bridge contract
      // Note: We might need to reset approval to 0 first if there's an existing approval
      void approve.send(bridgeContract?.address, bridgeRequest.amount);
    }
  }, [bridgeRequest, account, approve, bridgeContract]);

  // Handle approval errors
  useEffect(() => {
    if (approve.state.status === "Exception") {
      console.error("Approval failed:", approve.state.errorMessage);
      lock.current = false; // Reset lock so user can try again
    }
  }, [approve.state.status]);

  // Handle bridgeTo errors
  useEffect(() => {
    if (bridgeTo.state.status === "Exception") {
      console.error("BridgeTo failed:", bridgeTo.state.errorMessage);
      lock.current = false; // Reset lock so user can try again
    }
  }, [bridgeTo.state.status]);

  // Trigger the bridge request after approval is successful
  useEffect(() => {
    // Bridge flow status check

    if (approve.state.status === "Success" && bridgeTo.state.status === "None" && bridgeRequest && account) {
      console.log("🌉 Starting bridge process...");

      // Get fee estimate from GoodDollar Bridge API
      fetchBridgeFees()
        .then(fees => {
          // Bridge fees fetched successfully

          // Get the correct fee based on source, target, and bridge provider
          const sourceChainName =
            bridgeRequest.sourceChainId === SupportedChains.FUSE
              ? "fuse"
              : bridgeRequest.sourceChainId === SupportedChains.CELO
              ? "celo"
              : "mainnet";
          const targetChainName =
            bridgeRequest.targetChainId === SupportedChains.FUSE
              ? "fuse"
              : bridgeRequest.targetChainId === SupportedChains.CELO
              ? "celo"
              : "mainnet";

          // Use the same fee parsing logic as the UI component
          const sourceUpper = sourceChainName.toUpperCase();
          const targetUpper = targetChainName.toUpperCase();
          let feeString: string | null = null;

          if (bridgeProvider === "axelar") {
            const axelarFees = fees.AXELAR;
            if (sourceUpper === "CELO" && targetUpper === "MAINNET" && axelarFees.AXL_CELO_TO_ETH) {
              feeString = axelarFees.AXL_CELO_TO_ETH;
            }
            if (sourceUpper === "MAINNET" && targetUpper === "CELO" && axelarFees.AXL_ETH_TO_CELO) {
              feeString = axelarFees.AXL_ETH_TO_CELO;
            }
          } else if (bridgeProvider === "layerzero") {
            const layerzeroFees = fees.LAYERZERO;
            // Check specific routes first to avoid wrong matches
            if (sourceUpper === "CELO" && targetUpper === "FUSE" && layerzeroFees.LZ_CELO_TO_FUSE) {
              feeString = layerzeroFees.LZ_CELO_TO_FUSE;
            } else if (sourceUpper === "FUSE" && targetUpper === "CELO" && layerzeroFees.LZ_FUSE_TO_CELO) {
              feeString = layerzeroFees.LZ_FUSE_TO_CELO;
            } else if (sourceUpper === "CELO" && targetUpper === "MAINNET" && layerzeroFees.LZ_CELO_TO_ETH) {
              feeString = layerzeroFees.LZ_CELO_TO_ETH;
            } else if (sourceUpper === "MAINNET" && targetUpper === "CELO" && layerzeroFees.LZ_ETH_TO_CELO) {
              feeString = layerzeroFees.LZ_ETH_TO_CELO;
            } else if (sourceUpper === "FUSE" && targetUpper === "MAINNET" && layerzeroFees.LZ_FUSE_TO_ETH) {
              feeString = layerzeroFees.LZ_FUSE_TO_ETH;
            } else if (sourceUpper === "MAINNET" && targetUpper === "FUSE" && layerzeroFees.LZ_ETH_TO_FUSE) {
              feeString = layerzeroFees.LZ_ETH_TO_FUSE;
            }
          }

          if (feeString && typeof feeString === "string") {
            // Parse the fee string (e.g., "0.13447218229501165 CELO")
            const [feeAmount, currency] = feeString.split(" ");
            const nativeFee = convertFeeToWei(feeAmount, currency);
            console.log(`✅ Bridge fee2: ${feeAmount} ${currency}`);

            const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

            void bridgeTo.send(
              bridgeRequest.target || account,
              bridgeRequest.targetChainId,
              bridgeRequest.amount,
              bridgeService,
              { value: nativeFee } as any
            );
          } else {
            // Fallback to default fee if no specific route found
            const defaultFee = "100000000000000000"; // 0.1 ETH
            console.log(`❌ Using fallback fee: 0.1 ETH`);

            const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

            void bridgeTo.send(
              bridgeRequest.target || account,
              bridgeRequest.targetChainId,
              bridgeRequest.amount,
              bridgeService,
              { value: defaultFee } as any
            );
          }
        })
        .catch(e => {
          console.error("MPB Bridge error:", e);
          throw e;
        });
    }
  }, [approve.state.status, bridgeTo.state.status, bridgeRequest, account, bridgeProvider]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: bridgeTo.state,
    bridgeStatus,
    bridgeRequest
  };
};

// Explorer link functions
export const getLayerZeroExplorerLink = (txHash: string, chainId: number) => {
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "ethereum";
  return `https://layerzeroscan.com/${chainName}/tx/${txHash}`;
};

export const getAxelarExplorerLink = (txHash: string, chainId: number) => {
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "ethereum";
  return `https://axelarscan.io/${chainName}/tx/${txHash}`;
};

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
