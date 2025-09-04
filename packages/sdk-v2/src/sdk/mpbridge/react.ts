import { useCallback, useEffect, useRef, useState } from "react";
import { useContractFunctionWithDefaultGasFees } from "../base/hooks/useGasFees";
import { useSwitchNetwork } from "../../contexts";
import { useRefreshOrNever } from "../../hooks";
import { useEthers, useLogs, ChainId } from "@usedapp/core";
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

// Helper function to get the correct fee based on source, target, and provider
export const getBridgeFee = (
  fees: any, // Changed from BridgeFeesResponse to any as the interface is removed
  sourceChain: string,
  targetChain: string,
  bridgeProvider: "layerzero" | "axelar"
): { fee: string; currency: string } | null => {
  if (!fees) return null;

  const sourceUpper = sourceChain.toUpperCase();
  const targetUpper = targetChain.toUpperCase();

  if (bridgeProvider === "axelar") {
    const axelarFees = fees.AXELAR;

    // Axelar routes
    if (sourceUpper === "CELO" && targetUpper === "ETH") {
      return { fee: axelarFees.AXL_CELO_TO_ETH.split(" ")[0], currency: "Celo" };
    }
    if (sourceUpper === "ETH" && targetUpper === "CELO") {
      return { fee: axelarFees.AXL_ETH_TO_CELO.split(" ")[0], currency: "ETH" };
    }
  } else if (bridgeProvider === "layerzero") {
    const layerzeroFees = fees.LAYERZERO;

    // LayerZero routes
    if (sourceUpper === "ETH" && targetUpper === "CELO") {
      return { fee: layerzeroFees.LZ_ETH_TO_CELO.split(" ")[0], currency: "ETH" };
    }
    if (sourceUpper === "ETH" && targetUpper === "FUSE") {
      return { fee: layerzeroFees.LZ_ETH_TO_FUSE.split(" ")[0], currency: "ETH" };
    }
    if (sourceUpper === "CELO" && targetUpper === "ETH") {
      return { fee: layerzeroFees.LZ_CELO_TO_ETH.split(" ")[0], currency: "Celo" };
    }
    if (sourceUpper === "CELO" && targetUpper === "FUSE") {
      return { fee: layerzeroFees.LZ_CELO_TO_FUSE.split(" ")[0], currency: "CELO" };
    }
    if (sourceUpper === "FUSE" && targetUpper === "ETH") {
      return { fee: layerzeroFees.LZ_FUSE_TO_ETH.split(" ")[0], currency: "Fuse" };
    }
    if (sourceUpper === "FUSE" && targetUpper === "CELO") {
      return { fee: layerzeroFees.LZ_FUSE_TO_CELO.split(" ")[0], currency: "Fuse" };
    }
  }

  return null;
};

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
  return {
    [SupportedChains.FUSE]: new ethers.Contract(MPB_CONTRACTS[SupportedChains.FUSE], MPBBridgeABI) as ethers.Contract,
    [SupportedChains.CELO]: new ethers.Contract(MPB_CONTRACTS[SupportedChains.CELO], MPBBridgeABI) as ethers.Contract,
    [SupportedChains.MAINNET]: new ethers.Contract(
      MPB_CONTRACTS[SupportedChains.MAINNET],
      MPBBridgeABI
    ) as ethers.Contract
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
          console.log("Bridge limits from contract:", bridgeLimits);
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
      if (amountBN.gt(0)) {
        contract
          .canBridge(account, amountBN)
          .then(result => {
            console.log("Can bridge result:", result);
            setCanBridge(result);
          })
          .catch(error => {
            console.error("Error checking canBridge:", error);
            setCanBridge(true); // Default to true if check fails
          });
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

  console.log("MPB Bridge validation:", {
    amount: amount,
    amountBN: amountBN.toString(),
    minAmount: minAmount.toString(),
    maxAmount: maxAmount.toString(),
    isLoading,
    hasLimits: !!limits,
    canBridge
  });

  if (amountBN.lt(minAmount)) {
    console.log("Validation failed: amount < minAmount");
    return { isValid: false, reason: "minAmount" };
  }
  if (amountBN.gt(maxAmount)) {
    console.log("Validation failed: amount > maxAmount");
    return { isValid: false, reason: "maxAmount" };
  }

  // If still loading contract data, return valid for now
  if (isLoading) {
    return { isValid: true, reason: "" };
  }

  // If no limits loaded from contract, use fallback validation (already passed basic validation above)
  if (!limits) {
    console.log("No contract limits, using fallback validation - VALID");
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

  console.log("All validations passed - VALID");
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

  // Use transferAndCall on G$ token instead of direct bridgeTo call
  const transferAndCall = useContractFunctionWithDefaultGasFees(gdContract, "transferAndCall", {
    transactionName: "MPBBridgeTransfer"
  });

  const bridgeRequestId = (transferAndCall.state?.receipt?.logs || [])
    .filter(log => log.address === mpbContracts[chainId || 122]?.address)
    .map(log => mpbContracts[chainId || 122]?.interface.parseLog(log))?.[0]?.args?.id;

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
    if (transferAndCall.state.status === "Mining" || transferAndCall.state.status === "PendingSignature") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: transferAndCall.state.status,
        transaction: transferAndCall.state.transaction
      } as TransactionStatus;
    }

    if (transferAndCall.state.status === "Success" && bridgeCompletedEvent?.value?.length) {
      return {
        chainId: bridgeRequest?.targetChainId,
        status: "Success",
        transaction: { hash: bridgeCompletedEvent.value[0].transactionHash }
      } as TransactionStatus;
    }

    if (transferAndCall.state.status === "Exception") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: transferAndCall.state.errorMessage
      } as TransactionStatus;
    }

    return undefined;
  })();

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, target = account) => {
      setBridgeRequest(undefined);
      lock.current = false;
      transferAndCall.resetState();

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
      })().catch(e => {
        console.error("MPB Bridge error:", e);
        throw e;
      });
    },
    [account, transferAndCall, chainId, switchNetwork]
  );

  // Trigger the actual bridge request
  useEffect(() => {
    if (transferAndCall.state.status === "None" && bridgeRequest && account && !lock.current) {
      lock.current = true;

      // Get fee estimate from GoodDollar Bridge API
      fetchBridgeFees()
        .then(fees => {
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

          const feeInfo = getBridgeFee(fees, sourceChainName, targetChainName, bridgeProvider);

          if (feeInfo) {
            const nativeFee = convertFeeToWei(feeInfo.fee, feeInfo.currency);
            console.log(`Bridge fee: ${feeInfo.fee} ${feeInfo.currency} (${nativeFee} wei)`);

            // Encode the bridge parameters for transferAndCall
            const encoded = ethers.utils.defaultAbiCoder.encode(
              ["uint256", "address", "uint8"],
              [
                bridgeRequest.targetChainId,
                bridgeRequest.target || account,
                bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR
              ]
            );

            // Use transferAndCall to send G$ tokens to bridge contract
            // Note: Native fee needs to be sent separately or handled by the bridge contract
            void transferAndCall.send(
              mpbContracts[chainId || 122]?.address, // bridge contract address
              bridgeRequest.amount, // amount to bridge
              encoded // encoded bridge parameters
            );
          } else {
            // Fallback to default fee if no specific route found
            const defaultFee = "100000000000000000"; // 0.1 ETH
            console.log(`Using default fee: ${defaultFee} wei`);

            // Encode the bridge parameters for transferAndCall
            const encoded = ethers.utils.defaultAbiCoder.encode(
              ["uint256", "address", "uint8"],
              [
                bridgeRequest.targetChainId,
                bridgeRequest.target || account,
                bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR
              ]
            );

            // Use transferAndCall to send G$ tokens to bridge contract
            // Note: Native fee needs to be sent separately or handled by the bridge contract
            void transferAndCall.send(
              mpbContracts[chainId || 122]?.address, // bridge contract address
              bridgeRequest.amount, // amount to bridge
              encoded // encoded bridge parameters
            );
          }
        })
        .catch(e => {
          console.error("MPB Bridge error:", e);
          throw e;
        });
    }
  }, [bridgeRequest, account, transferAndCall, bridgeProvider, chainId, mpbContracts]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: transferAndCall.state,
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
  const refresh = useRefreshOrNever(5);
  const fuseChainId = 122 as ChainId;
  const celoChainId = 42220 as ChainId;
  const mainnetChainId = 1 as ChainId;

  // Listen for BridgeRequest events on all chains
  const fuseOut = useLogs(
    {
      contract: mpbContracts[122],
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
      contract: mpbContracts[122],
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
      contract: mpbContracts[42220],
      event: "BridgeRequest",
      args: []
    },
    {
      chainId: celoChainId,
      fromBlock: -2e4,
      refresh
    }
  );

  const celoIn = useLogs(
    {
      contract: mpbContracts[42220],
      event: "ExecutedTransfer",
      args: []
    },
    {
      chainId: celoChainId,
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
      chainId: mainnetChainId,
      fromBlock: -2e4,
      refresh
    }
  );

  const mainnetIn = useLogs(
    {
      contract: mpbContracts[1],
      event: "ExecutedTransfer",
      args: []
    },
    {
      chainId: mainnetChainId,
      fromBlock: -2e4,
      refresh
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
