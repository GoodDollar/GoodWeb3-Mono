import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useSwitchNetwork } from "../../contexts";
import { useRefreshOrNever } from "../../hooks";
import { useLogs } from "@usedapp/core";
import { ethers } from "ethers";
import { SupportedChains } from "../constants";
import { TransactionStatus } from "@usedapp/core";
import { useGetContract } from "../base/react";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { MPBBridgeABI, MPB_CONTRACTS, BridgeService, MPBBridgeData, BridgeRequest } from "./types";
import { fetchBridgeFees, convertFeeToWei } from "./api";

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
            minAmount: ethers.BigNumber.from("1000000000000000000000"), // 1000 G$
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
  // Use a higher minimum amount to match contract requirements
  const minAmount = ethers.BigNumber.from("1000000000000000000000"); // 1000 G$
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

export const useGetMPBBridgeData = (
  sourceChain?: string,
  targetChain?: string,
  bridgeProvider: "layerzero" | "axelar" = "layerzero"
): MPBBridgeData => {
  const [bridgeFees, setBridgeFees] = useState<{
    nativeFee: ethers.BigNumber | null;
    zroFee: ethers.BigNumber | null;
  }>({
    nativeFee: null,
    zroFee: null
  });
  const [bridgeLimits] = useState({
    minAmount: ethers.BigNumber.from("1000000000000000000000"), // 1000 G$
    maxAmount: ethers.BigNumber.from("1000000000000000000000000") // 1M G$
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    fetchBridgeFees()
      .then(fees => {
        if (!isMounted) return; // Prevent state updates if component unmounted

        if (fees) {
          console.log("🔍 Raw API fees:", fees);

          // Use dynamic route-specific parsing based on parameters
          const sourceUpper = (sourceChain || "celo").toUpperCase();
          const targetUpper = (targetChain || "fuse").toUpperCase();
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
            // Parse the fee string (e.g., "0.1344273492537784 CELO")
            const [feeAmount, currency] = feeString.split(" ");
            const nativeFee = convertFeeToWei(feeAmount, currency);

            console.log(`✅ Parsed fee for ${sourceUpper}→${targetUpper}: ${feeAmount} ${currency} = ${nativeFee} wei`);

            setBridgeFees({
              nativeFee: ethers.BigNumber.from(nativeFee),
              zroFee: ethers.BigNumber.from(0)
            });
          } else {
            console.error(`❌ No fee found for ${sourceUpper}→${targetUpper} with ${bridgeProvider}`);
            setBridgeFees({
              nativeFee: null,
              zroFee: null
            });
          }
        } else {
          console.error("❌ Failed to fetch fees from API");
          setBridgeFees({
            nativeFee: null,
            zroFee: null
          });
        }
        setIsLoading(false);
      })
      .catch(error => {
        if (!isMounted) return; // Prevent state updates if component unmounted

        console.error("Failed to fetch bridge fees:", error);
        setBridgeFees({
          nativeFee: null,
          zroFee: null
        });
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sourceChain, targetChain, bridgeProvider]);

  return { bridgeFees, bridgeLimits, isLoading };
};

export const useMPBBridge = (bridgeProvider: "layerzero" | "axelar" = "axelar") => {
  const lock = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId } = useEthers();
  const mpbContracts = useGetMPBContracts();

  const [bridgeRequest, setBridgeRequest] = useState<BridgeRequest | undefined>();

  // Get G$ token contract for the current chain
  const gdContract = useGetContract("GoodDollar", true, "base", chainId) as IGoodDollar;

  // Use transferAndCall on the G$ token contract to transfer and call bridge in one transaction
  const bridgeContract = mpbContracts[chainId || 122];
  const transferAndCall = useContractFunction(gdContract, "transferAndCall", {
    transactionName: "MPBBridgeTransfer"
  });

  // Extract bridge request ID from transferAndCall logs
  // Only run this when we have a successful transaction
  const bridgeRequestId = useMemo(() => {
    if (transferAndCall.state?.status !== "Success" || !transferAndCall.state?.receipt?.logs) {
      return undefined;
    }

    const logs = transferAndCall.state.receipt.logs;
    console.log("🔍 TransferAndCall logs:", logs);

    // Look for BridgeRequest event by checking the topic hash directly
    // BridgeRequest event signature: BridgeRequest(uint256,uint256,address,address,uint256,uint8,uint256)
    const bridgeRequestTopic = "0x4246d22454f5bd543c70e6ffcca20eed2dcf09d3beef6d39e415385538b02d0a";

    for (const log of logs) {
      if (log.address === bridgeContract?.address && log.topics[0] === bridgeRequestTopic) {
        console.log("📋 Found BridgeRequest event:", log);
        // Extract the bridge ID from the last topic (index 6)
        if (log.topics[6]) {
          const bridgeId = ethers.BigNumber.from(log.topics[6]).toString();
          console.log("🆔 Bridge ID:", bridgeId);
          return bridgeId;
        }
      }
    }

    console.log("❌ No BridgeRequest event found in logs");
    return undefined;
  }, [transferAndCall.state?.status, transferAndCall.state?.receipt?.logs, bridgeContract]);

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
    async (amount: string, sourceChain: string, targetChain: string, target = account) => {
      setBridgeRequest(undefined);
      lock.current = false;
      transferAndCall.resetState();

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
    [account, transferAndCall, chainId, switchNetwork]
  );

  // Handle transferAndCall errors
  useEffect(() => {
    if (transferAndCall.state.status === "Exception") {
      console.error("TransferAndCall failed:", transferAndCall.state.errorMessage);
      lock.current = false; // Reset lock so user can try again
    }
  }, [transferAndCall.state.status]);

  // Trigger the bridge request using transferAndCall
  useEffect(() => {
    if (transferAndCall.state.status === "None" && bridgeRequest && account && !lock.current) {
      lock.current = true;
      console.log("🌉 Starting bridge process with transferAndCall...");

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
            console.log(`✅ Bridge fee: ${feeAmount} ${currency}`);

            const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

            // Encode the bridge parameters for transferAndCall
            const encoded = ethers.utils.defaultAbiCoder.encode(
              ["uint256", "address", "uint8"],
              [bridgeRequest.targetChainId, bridgeRequest.target || account, bridgeService]
            );

            // Use transferAndCall to transfer tokens and call bridge in one transaction
            // Note: Native fees are handled by the bridge contract internally
            void transferAndCall.send(bridgeContract?.address, bridgeRequest.amount, encoded);
          } else {
            // No fee found for this route - throw error instead of using hardcoded fallback
            console.error(`❌ No fee found for ${sourceUpper}→${targetUpper} with ${bridgeProvider}`);
            throw new Error(`Bridge fee not available for ${sourceUpper}→${targetUpper} route`);
          }
        })
        .catch(e => {
          console.error("MPB Bridge error:", e);
          lock.current = false; // Reset lock on error
          throw e;
        });
    }
  }, [transferAndCall.state.status, bridgeRequest, account, bridgeProvider, bridgeContract]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: transferAndCall.state,
    bridgeStatus,
    bridgeRequest
  };
};
