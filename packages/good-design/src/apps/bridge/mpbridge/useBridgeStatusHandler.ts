import React, { useEffect } from "react";
import { TransactionStatus } from "@usedapp/core";

interface UseBridgeStatusHandlerParams {
  bridgeStatus: Partial<TransactionStatus> | undefined;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (error: Error) => void;
  setBridging: (value: boolean) => void;
  setBridgingStatus: (value: string) => void;
  setSuccessModalOpen: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  successModalOpen: boolean;
}

interface BridgeStatusRefs {
  successHandled: React.MutableRefObject<boolean>;
  approveTxHash: React.MutableRefObject<string | undefined>;
  bridgeToTxHash: React.MutableRefObject<string | undefined>;
  successModalDismissed: React.MutableRefObject<boolean>;
}

export const useBridgeStatusHandler = (params: UseBridgeStatusHandlerParams, refs: BridgeStatusRefs) => {
  const {
    bridgeStatus,
    onBridgeSuccess,
    onBridgeFailed,
    setBridging,
    setBridgingStatus,
    setSuccessModalOpen,
    setErrorMessage,
    successModalOpen
  } = params;

  const { successHandled, approveTxHash, bridgeToTxHash, successModalDismissed } = refs;

  useEffect(() => {
    const status = (bridgeStatus?.status as string) ?? "";
    const isSuccess = status === "Success";
    const isFailed = ["Fail", "Exception"].includes(status);
    const isBridgingActive = !isFailed && !isSuccess && ["Mining", "PendingSignature"].includes(status);
    const currentTxHash = bridgeStatus?.transaction?.hash;

    console.log("[MPBBridge] Bridge status changed:", {
      status,
      chainId: (bridgeStatus as any)?.chainId,
      transactionHash: currentTxHash,
      errorMessage: bridgeStatus?.errorMessage,
      approveTxHash: approveTxHash.current,
      bridgeToTxHash: bridgeToTxHash.current,
      fullStatus: bridgeStatus
    });

    if ((status === "Mining" || status === "PendingSignature") && currentTxHash && !approveTxHash.current) {
      approveTxHash.current = currentTxHash;
      console.log("[MPBBridge] Approve transaction detected", { txHash: currentTxHash });
    }

    const isBridgeToExecuted =
      (status === "Mining" || status === "PendingSignature") &&
      currentTxHash &&
      currentTxHash !== bridgeToTxHash.current &&
      (currentTxHash !== approveTxHash.current || !approveTxHash.current);

    if (isBridgeToExecuted && !successModalDismissed.current) {
      bridgeToTxHash.current = currentTxHash;
      console.log("[MPBBridge] bridgeTo executed - opening modal to track transaction stages", {
        txHash: currentTxHash,
        approveWasSkipped: !approveTxHash.current
      });
      setSuccessModalOpen(true);
    }

    if (bridgeStatus?.status !== "Success") {
      successHandled.current = false;
    }

    if (bridgeStatus) {
      setBridging(isBridgingActive || status === "Mining" || status === "PendingSignature");
    }

    if (bridgeStatus?.status === "PendingSignature") {
      console.log("[MPBBridge] PendingSignature - waiting for user signature");
      if (bridgeStatus?.errorMessage) {
        setBridgingStatus("Switching network. Please approve in your wallet...");
      } else if (isBridgeToExecuted) {
        setBridgingStatus("Please sign the bridge transaction in your wallet...");
      } else {
        setBridgingStatus("Please sign the transaction in your wallet...");
      }
    }

    if (bridgeStatus?.status === "Mining") {
      console.log("[MPBBridge] Mining - transaction submitted, waiting for confirmation");
      if (isBridgeToExecuted) {
        setBridgingStatus("Bridge transaction submitted. Waiting for confirmation...");
      } else {
        setBridgingStatus("Transaction submitted. Waiting for confirmation...");
      }
    }

    if (bridgeStatus?.status === "Success" && !successHandled.current) {
      console.log("[MPBBridge] Success - bridgeTo transaction completed", {
        transactionHash: bridgeStatus?.transaction?.hash,
        chainId: (bridgeStatus as any)?.chainId
      });
      successHandled.current = true;
      setBridgingStatus("Bridge completed successfully!");
      setBridging(false);
      if (!successModalOpen && !successModalDismissed.current) {
        setSuccessModalOpen(true);
      }

      setTimeout(() => {
        setBridgingStatus("");
      }, 3000);
      onBridgeSuccess?.();
    }

    if (isFailed) {
      console.log("[MPBBridge] Failed - bridge transaction failed", {
        errorMessage: bridgeStatus?.errorMessage,
        status
      });
      setSuccessModalOpen(false);
      const errorMsg = bridgeStatus?.errorMessage || "Failed to bridge";

      const isUserRejection =
        errorMsg.toLowerCase().includes("user rejected") ||
        errorMsg.toLowerCase().includes("user denied") ||
        errorMsg.toLowerCase().includes("rejected") ||
        errorMsg.toLowerCase().includes("cancelled");

      if (isUserRejection) {
        setBridgingStatus("Transaction cancelled");
        setTimeout(() => {
          setBridging(false);
          setBridgingStatus("");
        }, 2000);
      } else {
        setErrorMessage(errorMsg);
        setBridging(false);
      }

      if (!isUserRejection) {
        const exception = new Error(errorMsg);
        onBridgeFailed?.(exception);
      }
      approveTxHash.current = undefined;
      bridgeToTxHash.current = undefined;
    }
  }, [
    bridgeStatus,
    onBridgeSuccess,
    onBridgeFailed,
    successModalOpen,
    setBridging,
    setBridgingStatus,
    setSuccessModalOpen,
    setErrorMessage,
    successHandled,
    approveTxHash,
    bridgeToTxHash,
    successModalDismissed
  ]);
};
