import { useCallback, useEffect, useRef, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { useSwitchNetwork } from "../../../contexts";
import { BridgeService, BridgeRequest, UseMPBBridgeReturn } from "../types";
import { fetchBridgeFees } from "../api";
import {
  BridgeProvider,
  getChainName,
  getTargetChainId,
  getSourceChainId,
  calculateBridgeFees,
  createEmptyBridgeFees
} from "../constants";
import { SupportedChains } from "../../constants";
import { useGetMPBContract, useNativeTokenContract } from "./useGetMPBContract";
import { useLayerZeroFee } from "./useLayerZeroFee";
import { useBridgeMonitoring } from "./useBridgeMonitoring";
import { useBridgeValidators } from "./useBridgeValidators";

export const useMPBBridge = (bridgeProvider: BridgeProvider = "axelar"): UseMPBBridgeReturn => {
  const bridgeLock = useRef(false);
  const bridgeToTriggered = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId, library } = useEthers();

  const [bridgeRequest, setBridgeRequest] = useState<BridgeRequest | undefined>();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [switchChainError, setSwitchChainError] = useState<string | undefined>();
  const [tokenDecimals, setTokenDecimals] = useState<number | undefined>();

  // Get the native token contract that the bridge uses (instead of hardcoded dev G$)
  const gdContract = useNativeTokenContract(chainId);

  // Get MPB bridge contract for the current chain
  const bridgeContract = useGetMPBContract(chainId);

  // MPB uses approve + bridgeTo pattern (not transferAndCall like the old TokenBridge)
  const approve = useContractFunction(gdContract, "approve", {
    transactionName: "MPBBridgeApprove"
  });

  const bridgeTo = useContractFunction(bridgeContract, "bridgeTo", {
    transactionName: "MPBBridgeTo"
  });

  // Use extracted hooks
  const { computeLayerZeroFee } = useLayerZeroFee(bridgeContract, bridgeProvider, account, tokenDecimals, gdContract);

  const { bridgeStatus } = useBridgeMonitoring(
    bridgeRequest,
    bridgeContract,
    approve.state,
    bridgeTo.state,
    isSwitchingChain,
    switchChainError
  );

  const { validateBridgeTransaction } = useBridgeValidators(
    account,
    gdContract,
    bridgeContract,
    bridgeProvider,
    tokenDecimals,
    library
  );

  useEffect(() => {
    let isMounted = true;

    if (!gdContract) {
      setTokenDecimals(undefined);
      return;
    }

    gdContract
      .decimals()
      .then(dec => {
        if (isMounted) {
          setTokenDecimals(Number(dec));
        }
      })
      .catch(error => {
        console.error("Failed to load token decimals:", error);
        if (isMounted) {
          setTokenDecimals(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [gdContract]);

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, targetChain: string, target?: string) => {
      // Don't reset if transaction is currently being mined
      const isActivelyMining = approve.state.status === "Mining" || bridgeTo.state.status === "Mining";

      if (!isActivelyMining) {
        // Always reset state for a new bridge attempt
        console.log("🔄 Resetting bridge state for new attempt");
        setBridgeRequest(undefined);
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        approve.resetState();
        bridgeTo.resetState();
        setSwitchChainError(undefined);
        setIsSwitchingChain(false);
      } else {
        console.log("⚠️ Transaction already mining, ignoring new bridge request");
        return;
      }

      const targetChainId = getTargetChainId(targetChain);
      const sourceChainId = getSourceChainId(sourceChain);

      try {
        if (sourceChainId !== chainId) {
          setIsSwitchingChain(true);
          console.log(`🔄 Switching network from ${chainId} to ${sourceChainId}...`);
          await switchNetwork(sourceChainId);
          setIsSwitchingChain(false);
        }

        setBridgeRequest({ amount, sourceChainId, targetChainId, target });
      } catch (error: any) {
        setIsSwitchingChain(false);
        const errorMessage = error?.message || "Failed to switch network";

        // Check if user rejected the chain switch
        const isUserRejection =
          errorMessage.toLowerCase().includes("user rejected") ||
          errorMessage.toLowerCase().includes("user denied") ||
          errorMessage.toLowerCase().includes("user cancelled");

        if (isUserRejection) {
          console.log("👤 User rejected chain switch, resetting state");
          // Reset all state on user rejection
          setBridgeRequest(undefined);
          bridgeLock.current = false;
          setSwitchChainError(undefined);
        } else {
          setSwitchChainError(errorMessage);
        }

        console.error("MPB Bridge error:", error);
        throw error;
      }
    },
    [account, approve, bridgeTo, chainId, switchNetwork]
  );

  // Handle approve and bridgeTo errors and completion
  useEffect(() => {
    const handleTransactionError = (
      status: string,
      errorMessage: string,
      txName: string,
      details?: any,
      stack?: string
    ) => {
      if (status === "Exception") {
        console.error(`${txName} failed:`, errorMessage);
        console.log("🔍 Attempting to extract error data from:", {
          hasErrorHash: !!details?.errorHash,
          errorHashData: details?.errorHash?.data,
          hasError: !!details?.error,
          errorData: details?.error?.data,
          hasData: !!details?.data
        });

        const errorData =
          details?.errorHash?.data ||
          details?.error?.data?.data ||
          details?.error?.data ||
          details?.data?.data ||
          details?.data ||
          details?.error?.error?.data ||
          (details?.error?.message?.includes("0x") ? details.error.message.match(/0x[a-fA-F0-9]+/)?.[0] : null);

        console.log("🔍 Extracted error data:", errorData);

        if (errorData) {
          if (typeof errorData === "string" && errorData.startsWith("0x")) {
            console.error(` Contract error code: ${errorData}`);

            // Try to decode the error using the contract interface
            let decodedErrorName: string | null = null;
            try {
              if (bridgeContract?.interface) {
                const decodedError = bridgeContract.interface.parseError(errorData);
                if (decodedError) {
                  decodedErrorName = decodedError.name;
                  console.error(`❌ Decoded error: ${decodedError.name}(${decodedError.args.join(", ")})`);

                  // Handle specific errors
                  if (decodedError.name === "UNSUPPORTED_CHAIN") {
                    const chainId = decodedError.args[0]?.toString();
                    console.error(`Target chain ${chainId} is not supported by the bridge contract`);
                    console.error(`Supported chains: ${Object.values(SupportedChains).join(", ")}`);
                  } else if (decodedError.name === "INVALID_TARGET_OR_CHAINID") {
                    console.error(` Invalid target address or chain ID`);
                    console.error(`Target: ${decodedError.args[0]}, Chain ID: ${decodedError.args[1]}`);
                  } else if (decodedError.name === "LZ_FEE") {
                    console.error(` Insufficient LayerZero fee`);
                    console.error(`Required: ${decodedError.args[0]}, Sent: ${decodedError.args[1]}`);
                  }
                }
              }
            } catch (decodeError) {
              console.warn("Failed to decode error:", decodeError);
            }
            if (!decodedErrorName && errorData === "0x10ecdf44") {
              console.error(" Contract reverted with error 0x10ecdf44. This might indicate:");
              console.error("  - Invalid bridge parameters (chain ID, service, etc.)");
              console.error("  - Contract validation failed (limits, whitelist, etc.)");
              console.error("  - LayerZero routing not configured in contract");
              console.error("  - Insufficient balance or allowance");
              console.error("  - Bridge service (LayerZero/Axelar) not properly configured");
              console.error("  - Target chain not supported or not configured");
            }
          }
        } else {
          console.warn("⚠️ Could not extract error code from error details");
        }

        // Log full details for debugging
        console.error(`📋 ${txName} full error details:`, details);
        if (stack) {
          console.error(`${txName} stack:`, stack);
        }

        // Check if user rejected the transaction
        const isUserRejection =
          errorMessage.toLowerCase().includes("user rejected") ||
          errorMessage.toLowerCase().includes("user denied") ||
          errorMessage.toLowerCase().includes("rejected") ||
          errorMessage.toLowerCase().includes("cancelled");

        if (isUserRejection) {
          console.log("👤 User rejected transaction, fully resetting state");
          // Fully reset state on user rejection
          setBridgeRequest(undefined);
          bridgeLock.current = false;
          approve.resetState();
          bridgeTo.resetState();
        } else {
          // For other errors, just reset the lock
          bridgeLock.current = false;
        }

        bridgeToTriggered.current = false;
      }

      // Reset lock on success to allow new transactions
      if (status === "Success") {
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
      }
    };

    // Call handleTransactionError for approve
    handleTransactionError(
      approve.state.status,
      approve.state.errorMessage || "",
      "Approve",
      (approve.state as any)?.error?.data,
      (approve.state as any)?.error?.stack
    );

    // Log the full error state for debugging
    if (bridgeTo.state.status === "Exception") {
      const bridgeToState = bridgeTo.state as any;
      console.error("🔍 Full bridgeTo error state:", JSON.stringify(bridgeToState, null, 2));
      console.error("🔍 bridgeTo.state.error:", bridgeToState.error);
      console.error("🔍 bridgeTo.state.errorMessage:", bridgeToState.errorMessage);
    }

    // Call handleTransactionError for bridgeTo
    handleTransactionError(
      bridgeTo.state.status,
      bridgeTo.state.errorMessage || "",
      "BridgeTo",
      bridgeTo.state as any, // Pass the entire state object to access all error data
      (bridgeTo.state as any)?.error?.stack
    );
  }, [approve.state, bridgeTo.state, approve, bridgeTo, bridgeContract]);

  // Reset chain switching state when chain successfully changes
  useEffect(() => {
    if (isSwitchingChain && bridgeRequest && chainId === bridgeRequest.sourceChainId) {
      setIsSwitchingChain(false);
    }
  }, [chainId, bridgeRequest, isSwitchingChain]);

  // Helper function to execute the actual bridge transfer (bridgeTo)
  const executeBridgeTransfer = useCallback(
    async (request: BridgeRequest) => {
      try {
        console.log("✅ Proceeding to bridge transfer...", request);

        const fees = await fetchBridgeFees();
        const { source, target } = {
          source: getChainName(request.sourceChainId),
          target: getChainName(request.targetChainId)
        };
        const calculatedFees = fees
          ? calculateBridgeFees(fees, bridgeProvider, source, target)
          : createEmptyBridgeFees();

        let nativeFee = calculatedFees.nativeFee ?? ethers.BigNumber.from(0);

        if (bridgeProvider === "layerzero") {
          nativeFee = (await computeLayerZeroFee(request, nativeFee)) ?? nativeFee;
        }

        if (!nativeFee || nativeFee.isZero()) {
          throw new Error("Bridge fee not available for the selected route.");
        }

        // Add a 5% buffer to reduce the odds of underpaying due to fee estimation drift
        const bufferedFee = nativeFee.mul(105).div(100);
        const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

        if (!request.target) {
          throw new Error("Target address is required");
        }

        console.log("🌉 Calling bridgeTo with:", {
          target: request.target,
          targetChainId: request.targetChainId,
          amount: request.amount,
          bridgeService,
          nativeFee: bufferedFee.toString()
        });

        void bridgeTo.send(request.target, request.targetChainId, request.amount, bridgeService, {
          value: bufferedFee
        });
      } catch (error: any) {
        console.error("BridgeTo preparation error:", error);
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        setSwitchChainError(error?.message || "Failed to prepare bridge transaction");
        setBridgeRequest(undefined);
      }
    },
    [bridgeProvider, bridgeTo, computeLayerZeroFee]
  );

  // Helper function to execute bridge transaction (approve if needed, then bridge)
  const executeBridgeTransaction = useCallback(
    async (bridgeRequest: BridgeRequest, fees: any) => {
      const { source, target } = {
        source: getChainName(bridgeRequest.sourceChainId),
        target: getChainName(bridgeRequest.targetChainId)
      };

      await validateBridgeTransaction(bridgeRequest, fees);

      const calculatedFees = calculateBridgeFees(fees, bridgeProvider, source, target);

      if (!calculatedFees.nativeFee) {
        const sourceUpper = source.toUpperCase();
        const targetUpper = target.toUpperCase();
        throw new Error(`Bridge fee not available for ${sourceUpper}→${targetUpper} route`);
      }

      if (!bridgeContract?.address) {
        console.error("Bridge contract address is missing!", bridgeContract);
        return;
      }

      // Check allowance first
      if (gdContract && account) {
        try {
          const allowance = await gdContract.allowance(account, bridgeContract.address);
          const amountBN = ethers.BigNumber.from(bridgeRequest.amount);

          console.log("🔍 Checking existing allowance:", {
            allowance: allowance.toString(),
            required: amountBN.toString(),
            sufficient: allowance.gte(amountBN)
          });

          if (allowance.gte(amountBN)) {
            console.log("✅ Allowance sufficient, skipping approval step...");
            // Skip approval and go straight to bridge
            bridgeToTriggered.current = true; // Mark as triggered to prevent double execution
            await executeBridgeTransfer(bridgeRequest);
            return;
          }
        } catch (error) {
          console.warn("Failed to check allowance, proceeding with approval flow:", error);
        }
      }

      const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

      console.log("Starting MPB bridge transaction (needs approval):", {
        bridgeContractAddress: bridgeContract.address,
        amount: bridgeRequest.amount,
        targetChainId: bridgeRequest.targetChainId,
        target: bridgeRequest.target || account,
        bridgeService,
        nativeFee: calculatedFees.nativeFee.toString()
      });

      // Step 1: Approve the bridge contract to spend tokens
      console.log("📝 Step 1: Approving bridge contract to spend G$ tokens...");
      void approve.send(bridgeContract.address, bridgeRequest.amount);
    },
    [bridgeProvider, bridgeContract, account, approve, validateBridgeTransaction, gdContract, executeBridgeTransfer]
  );

  useEffect(() => {
    const shouldExecute =
      approve.state.status === "None" &&
      bridgeTo.state.status === "None" &&
      bridgeRequest &&
      account &&
      !bridgeLock.current &&
      !isSwitchingChain;

    if (shouldExecute) {
      bridgeLock.current = true;
      console.log("🌉 Starting bridge process...", {
        bridgeRequest,
        account,
        chainId
      });

      fetchBridgeFees()
        .then(fees => {
          if (fees) {
            return executeBridgeTransaction(bridgeRequest, fees);
          } else {
            throw new Error("Failed to fetch bridge fees");
          }
        })
        .catch(error => {
          bridgeLock.current = false;
          console.error("Bridge execution error:", error);
          setSwitchChainError(error?.message || "Bridge execution failed");
          setBridgeRequest(undefined);
        });
    }
  }, [
    approve.state.status,
    bridgeTo.state.status,
    bridgeRequest,
    account,
    executeBridgeTransaction,
    isSwitchingChain,
    chainId
  ]);

  // Trigger bridgeTo after approve succeeds
  useEffect(() => {
    const isApproveSuccess = approve.state.status === "Success";
    const isBridgeIdle = bridgeTo.state.status === "None";

    if (!isApproveSuccess || !isBridgeIdle || !bridgeRequest || !bridgeContract) {
      return;
    }

    if (bridgeToTriggered.current) {
      return;
    }

    let isMounted = true;
    bridgeToTriggered.current = true;

    const proceed = async () => {
      console.log("✅ Approval successful! Step 2: Calling bridgeTo...");

      // Verify allowance before calling bridgeTo (double check)
      if (gdContract && bridgeContract && account) {
        try {
          const allowance = await gdContract.allowance(account, bridgeContract.address);
          const amountBN = ethers.BigNumber.from(bridgeRequest.amount);

          if (allowance.lt(amountBN)) {
            throw new Error(
              `Insufficient allowance. Approved: ${allowance.toString()}, Required: ${amountBN.toString()}`
            );
          }
        } catch (allowanceError: any) {
          console.error(" Allowance check failed:", allowanceError);
          throw allowanceError;
        }
      }

      if (isMounted) {
        await executeBridgeTransfer(bridgeRequest);
      }
    };

    void proceed();

    return () => {
      isMounted = false;
    };
  }, [account, approve.state.status, bridgeContract, bridgeRequest, bridgeTo, executeBridgeTransfer, gdContract]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: bridgeTo.state,
    bridgeStatus,
    bridgeRequest,
    isSwitchingChain
  };
};
