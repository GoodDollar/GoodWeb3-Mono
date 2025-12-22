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
      .catch(() => {
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

        setBridgeRequest(undefined);
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        approve.resetState();
        bridgeTo.resetState();
        setSwitchChainError(undefined);
        setIsSwitchingChain(false);
      } else {
        return;
      }

      const targetChainId = getTargetChainId(targetChain);
      const sourceChainId = getSourceChainId(sourceChain);

      try {
        if (sourceChainId !== chainId) {
          setIsSwitchingChain(true);

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
          // Reset all state on user rejection
          setBridgeRequest(undefined);
          bridgeLock.current = false;
          setSwitchChainError(undefined);
        } else {
          setSwitchChainError(errorMessage);
        }

        throw error;
      }
    },
    [account, approve, bridgeTo, chainId, switchNetwork]
  );

  // Handle approve and bridgeTo errors and completion
  useEffect(() => {
    const handleTransactionError = (status: string, errorMessage: string) => {
      if (status === "Exception") {
        // Check if user rejected the transaction
        const isUserRejection =
          errorMessage.toLowerCase().includes("user rejected") ||
          errorMessage.toLowerCase().includes("user denied") ||
          errorMessage.toLowerCase().includes("rejected") ||
          errorMessage.toLowerCase().includes("cancelled");

        if (isUserRejection) {
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
    handleTransactionError(approve.state.status, approve.state.errorMessage || "");

    // Call handleTransactionError for bridgeTo
    handleTransactionError(bridgeTo.state.status, bridgeTo.state.errorMessage || "");
  }, [approve.state, bridgeTo.state, approve, bridgeTo]);

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
        console.log("[useMPBBridge] executeBridgeTransfer - preparing bridgeTo transaction", {
          sourceChainId: request.sourceChainId,
          targetChainId: request.targetChainId,
          amount: request.amount,
          target: request.target,
          bridgeProvider
        });

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

        console.log("[useMPBBridge] executeBridgeTransfer - calling bridgeTo.send", {
          target: request.target,
          targetChainId: request.targetChainId,
          amount: request.amount,
          bridgeService,
          bufferedFee: bufferedFee.toString()
        });

        void bridgeTo.send(request.target, request.targetChainId, request.amount, bridgeService, {
          value: bufferedFee
        });
      } catch (error: any) {
        console.error("[useMPBBridge] executeBridgeTransfer - error", error);
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
        return;
      }

      // Check allowance first
      if (gdContract && account) {
        try {
          const allowance = await gdContract.allowance(account, bridgeContract.address);
          const amountBN = ethers.BigNumber.from(bridgeRequest.amount);

          if (allowance.gte(amountBN)) {
            // Skip approval and go straight to bridge
            bridgeToTriggered.current = true; // Mark as triggered to prevent double execution
            await executeBridgeTransfer(bridgeRequest);
            return;
          }
        } catch (error) {
          // Failed to check allowance, proceed with approval flow
        }
      }

      // Step 1: Approve the bridge contract to spend tokens
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
          setSwitchChainError(error?.message || "Bridge execution failed");
          setBridgeRequest(undefined);
        });
    }
  }, [approve.state.status, bridgeTo.state.status, bridgeRequest, account, executeBridgeTransaction, isSwitchingChain]);

  // Trigger bridgeTo after approve succeeds
  useEffect(() => {
    const isApproveSuccess = approve.state.status === "Success";
    const isBridgeIdle = bridgeTo.state.status === "None";

    console.log("[useMPBBridge] Checking if bridgeTo should be triggered", {
      isApproveSuccess,
      isBridgeIdle,
      hasBridgeRequest: !!bridgeRequest,
      hasBridgeContract: !!bridgeContract,
      bridgeToTriggered: bridgeToTriggered.current,
      approveStatus: approve.state.status,
      bridgeToStatus: bridgeTo.state.status
    });

    if (!isApproveSuccess || !isBridgeIdle || !bridgeRequest || !bridgeContract) {
      return;
    }

    if (bridgeToTriggered.current) {
      console.log("[useMPBBridge] bridgeTo already triggered, skipping");
      return;
    }

    let isMounted = true;
    bridgeToTriggered.current = true;

    console.log("[useMPBBridge] Approve succeeded, triggering bridgeTo");

    const proceed = async () => {
      // Verify allowance before calling bridgeTo (double check)
      if (gdContract && bridgeContract && account) {
        const allowance = await gdContract.allowance(account, bridgeContract.address);
        const amountBN = ethers.BigNumber.from(bridgeRequest.amount);

        console.log("[useMPBBridge] Verifying allowance before bridgeTo", {
          allowance: allowance.toString(),
          required: amountBN.toString(),
          sufficient: allowance.gte(amountBN)
        });

        if (allowance.lt(amountBN)) {
          throw new Error(
            `Insufficient allowance. Approved: ${allowance.toString()}, Required: ${amountBN.toString()}`
          );
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
