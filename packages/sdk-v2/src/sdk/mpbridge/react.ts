import { useCallback, useEffect, useRef, useState } from "react";
import { useContractFunctionWithDefaultGasFees } from "../base/hooks/useGasFees";
import { useSwitchNetwork } from "../../contexts";
import { useRefreshOrNever } from "../../hooks";
import { useEthers, useLogs } from "@usedapp/core";
import { ethers } from "ethers";
import { SupportedChains } from "../constants";
import { TransactionStatus } from "@usedapp/core";

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

// MPB Contract ABI - this would need to be updated with actual MPB contract ABI
const MPBBridgeABI = [
  "function bridgeTo(uint256 destinationChainId, address recipient, uint256 amount, bytes calldata adapterParams) external payable",
  "function quoteFee(uint256 destinationChainId, bytes calldata adapterParams) external view returns (uint256 nativeFee, uint256 zroFee)",
  "function estimateSendFee(uint256 destinationChainId, address recipient, uint256 amount, bool payInLZToken, bytes calldata adapterParams) external view returns (uint256 nativeFee, uint256 zroFee)",
  "event BridgeRequest(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed sender, address recipient, uint256 amount, uint256 fee)",
  "event BridgeCompleted(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed recipient, uint256 amount)"
];

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

export const useMPBBridgeLimits = (amount: string) => {
  // For MPB, we'll implement basic validation
  // In a real implementation, this would call contract methods to check limits

  // Basic validation - in real implementation this would check actual contract limits
  const isValid = amount && ethers.BigNumber.from(amount).gt(0);
  const reason = isValid ? "" : "Invalid amount";

  return { isValid, reason };
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

  const bridgeTo = useContractFunctionWithDefaultGasFees(mpbContracts[chainId || 122], "bridgeTo", {
    transactionName: "MPBBridgeTransfer"
  });

  const bridgeRequestId = (bridgeTo.state?.receipt?.logs || [])
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
      })().catch(e => {
        console.error("MPB Bridge error:", e);
        throw e;
      });
    },
    [account, bridgeTo, chainId, switchNetwork]
  );

  // Trigger the actual bridge request
  useEffect(() => {
    if (bridgeTo.state.status === "None" && bridgeRequest && account && !lock.current) {
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

            // Send bridge transaction with real fee
            void bridgeTo.send(
              bridgeRequest.targetChainId,
              bridgeRequest.target || account,
              bridgeRequest.amount,
              "0x", // adapterParams
              { value: nativeFee }
            );
          } else {
            // Fallback to default fee if no specific route found
            const defaultFee = "100000000000000000"; // 0.1 ETH
            console.log(`Using default fee: ${defaultFee} wei`);

            void bridgeTo.send(
              bridgeRequest.targetChainId,
              bridgeRequest.target || account,
              bridgeRequest.amount,
              "0x", // adapterParams
              { value: defaultFee }
            );
          }
        })
        .catch(e => {
          console.error("MPB Bridge error:", e);
          throw e;
        });
    }
  }, [bridgeRequest, account, bridgeTo, bridgeProvider]);

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

// Bridge history hook
export const useMPBBridgeHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch bridge history from an API
    // For now, we'll return an empty array
    setLoading(false);
    setHistory([]); // Initialize with empty array
  }, []);

  return { history, loading };
};
