import { useCallback, useEffect, useRef, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { useSwitchNetwork } from "../../../contexts";
import { useG$Decimals } from "../../base/react";
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

import { useGetContract } from "../../base/react";
import { useMPBG$TokenContract } from "./useMPBG$TokenContract";
import { useLayerZeroFee } from "./useLayerZeroFee";
import { useBridgeMonitoring } from "./useBridgeMonitoring";
import { useBridgeValidators } from "./useBridgeValidators";

export const useMPBBridge = (bridgeProvider: BridgeProvider = "axelar"): UseMPBBridgeReturn => {
  const bridgeLock = useRef(false);
  const bridgeToTriggered = useRef(false);
  const bridgeToSending = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId, library } = useEthers();

  const [bridgeRequest, setBridgeRequest] = useState<BridgeRequest | undefined>();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [switchChainError, setSwitchChainError] = useState<string | undefined>();

  const gdContract = useMPBG$TokenContract(chainId);
  const bridgeContract = useGetContract("MPBBridge", false, "base", chainId);
  const bridgeContractOrNull = bridgeContract ?? null;
  const tokenDecimals = useG$Decimals("G$", chainId);

  const approve = useContractFunction(gdContract, "approve", {
    transactionName: "MPBBridgeApprove"
  });

  const bridgeTo = useContractFunction(bridgeContractOrNull, "bridgeTo", {
    transactionName: "MPBBridgeTo"
  });

  const { computeLayerZeroFee } = useLayerZeroFee(bridgeContractOrNull, bridgeProvider, account);

  const { bridgeStatus } = useBridgeMonitoring(
    bridgeRequest,
    bridgeContractOrNull,
    approve.state,
    bridgeTo.state,
    isSwitchingChain,
    switchChainError
  );

  const { validateBridgeTransaction } = useBridgeValidators(
    account,
    gdContract,
    bridgeContractOrNull,
    bridgeProvider,
    tokenDecimals,
    library
  );

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, targetChain: string, target?: string) => {
      // Don't reset if transaction is currently being mined
      const isActivelyMining = approve.state.status === "Mining" || bridgeTo.state.status === "Mining";

      if (!isActivelyMining) {
        // Always reset state for a new bridge attempt

        setBridgeRequest(undefined);
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        bridgeToSending.current = false;
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

  useEffect(() => {
    const handleApproveState = () => {
      const { status, errorMessage } = approve.state;

      if (status === "Exception") {
        const isUserRejection =
          (errorMessage || "").toLowerCase().includes("user rejected") ||
          (errorMessage || "").toLowerCase().includes("user denied") ||
          (errorMessage || "").toLowerCase().includes("rejected") ||
          (errorMessage || "").toLowerCase().includes("cancelled");

        if (isUserRejection) {
          setBridgeRequest(undefined);
          bridgeLock.current = false;
          bridgeToTriggered.current = false;
          approve.resetState();
          bridgeTo.resetState();
        } else {
          bridgeLock.current = false;
          bridgeToTriggered.current = false;
        }
      }

      if (status === "Success") {
        bridgeLock.current = false;
      }
    };

    const handleBridgeToState = () => {
      const { status, errorMessage } = bridgeTo.state;

      if (status === "Exception") {
        const isUserRejection =
          (errorMessage || "").toLowerCase().includes("user rejected") ||
          (errorMessage || "").toLowerCase().includes("user denied") ||
          (errorMessage || "").toLowerCase().includes("rejected") ||
          (errorMessage || "").toLowerCase().includes("cancelled");

        if (isUserRejection) {
          setBridgeRequest(undefined);
          bridgeLock.current = false;
          bridgeToTriggered.current = false;
          bridgeToSending.current = false;
          approve.resetState();
          bridgeTo.resetState();
        } else {
          bridgeLock.current = false;
          bridgeToTriggered.current = false;
          bridgeToSending.current = false;
        }
      }

      if (status === "Success") {
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        bridgeToSending.current = false;
      }
    };

    handleApproveState();
    handleBridgeToState();
  }, [approve.state, bridgeTo.state, approve, bridgeTo]);

  // Reset chain switching state when chain successfully changes
  useEffect(() => {
    if (isSwitchingChain && bridgeRequest && chainId === bridgeRequest.sourceChainId) {
      setIsSwitchingChain(false);
    }
  }, [chainId, bridgeRequest, isSwitchingChain]);

  const executeBridgeTransfer = useCallback(
    async (request: BridgeRequest) => {
      // Simple lock: if already sending, skip completely
      if (bridgeToSending.current) {
        console.log("[useMPBBridge] Skipping executeBridgeTransfer - already sending");
        return;
      }
      // Set the lock immediately before any async operations
      bridgeToSending.current = true;
      bridgeToTriggered.current = true;
      console.log("[useMPBBridge] executeBridgeTransfer started");

      try {
        const fees = await fetchBridgeFees();
        const source = getChainName(request.sourceChainId);
        const target = getChainName(request.targetChainId);
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

        if (!request.target) {
          throw new Error("Target address is required");
        }

        const bufferedFee = nativeFee.mul(105).div(100);
        const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

        void bridgeTo.send(request.target, request.targetChainId, request.amount, bridgeService, {
          value: bufferedFee
        });
      } catch (error: any) {
        console.error("[useMPBBridge] executeBridgeTransfer error", error);
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        bridgeToSending.current = false;
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

      // Check allowance — skip approval when already sufficient
      if (gdContract && account) {
        try {
          const allowance = await gdContract.allowance(account, bridgeContract.address);
          const amountBN = ethers.BigNumber.from(bridgeRequest.amount);

          if (allowance.gte(amountBN)) {
            console.log("[useMPBBridge] Allowance sufficient, executing bridgeTo directly");
            // executeBridgeTransfer handles its own locking
            await executeBridgeTransfer(bridgeRequest);
            return;
          }
        } catch (error) {
          // Failed to check allowance, proceed with approval flow
        }
      }

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

  useEffect(() => {
    const isApproveSuccess = approve.state.status === "Success";
    const isBridgeIdle = bridgeTo.state.status === "None";

    if (!isApproveSuccess || !isBridgeIdle || !bridgeRequest || !bridgeContract) {
      return;
    }

    if (bridgeToTriggered.current || bridgeToSending.current) {
      return;
    }

    console.log("[useMPBBridge] Approval success, executing bridgeTo");

    // No allowance re-check here: approve.state.status === "Success" already
    // guarantees the on-chain approval succeeded. Reading allowance via RPC
    // right after mining is unreliable (stale reads) and causes retry loops.
    // executeBridgeTransfer handles its own locking
    void executeBridgeTransfer(bridgeRequest);
  }, [approve.state.status, bridgeTo.state.status, bridgeRequest, bridgeContract, executeBridgeTransfer]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: bridgeTo.state,
    bridgeStatus,
    bridgeRequest,
    isSwitchingChain
  };
};
