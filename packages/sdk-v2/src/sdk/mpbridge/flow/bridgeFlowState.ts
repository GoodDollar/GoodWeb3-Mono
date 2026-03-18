import { DeriveMPBBridgeFlowStateParams, MPBBridgeFlowSnapshot } from "./types";

const PENDING_STATES = new Set(["PendingSignature", "Mining"]);

export const isUserRejectionError = (message?: string): boolean => {
  const normalized = (message || "").toLowerCase();

  return (
    normalized.includes("user rejected") ||
    normalized.includes("user denied") ||
    normalized.includes("rejected") ||
    normalized.includes("cancelled")
  );
};

export const deriveMPBBridgeFlowState = (params: DeriveMPBBridgeFlowStateParams): MPBBridgeFlowSnapshot => {
  const {
    bridgeStatus,
    isSwitchingChain = false,
    previousTxHashes,
    canSubmit: canSubmitInput = true,
    hasFeeError = false
  } = params;

  const status = bridgeStatus?.status ?? "";
  const currentTxHash = bridgeStatus?.transaction?.hash;
  const errorMessage = bridgeStatus?.errorMessage;

  const nextTxHashes = {
    ...(previousTxHashes || {})
  };

  if (PENDING_STATES.has(status) && currentTxHash && !nextTxHashes.approve) {
    nextTxHashes.approve = currentTxHash;
  }

  const isBridgeToExecuted =
    PENDING_STATES.has(status) &&
    !!currentTxHash &&
    currentTxHash !== nextTxHashes.bridgeTo &&
    (currentTxHash !== nextTxHashes.approve || !nextTxHashes.approve);

  if (isBridgeToExecuted && currentTxHash) {
    nextTxHashes.bridgeTo = currentTxHash;
  }

  if (status === "Success") {
    nextTxHashes.final = currentTxHash || nextTxHashes.bridgeTo || nextTxHashes.approve;
  }

  if (status === "None") {
    return {
      state: "idle",
      statusLabel: "",
      isBusy: false,
      showSuccess: false,
      currentTxHashes: nextTxHashes,
      canSubmit: canSubmitInput && !hasFeeError
    };
  }

  if (isSwitchingChain || (status === "PendingSignature" && !!errorMessage)) {
    return {
      state: "awaiting_network_switch",
      statusLabel: "Switching network. Please approve in your wallet...",
      isBusy: true,
      showSuccess: false,
      currentTxHashes: nextTxHashes,
      canSubmit: false
    };
  }

  if (status === "PendingSignature") {
    return {
      state: isBridgeToExecuted ? "awaiting_bridge_signature" : "awaiting_approval_signature",
      statusLabel: isBridgeToExecuted
        ? "Please sign the bridge transaction in your wallet..."
        : "Please sign the transaction in your wallet...",
      isBusy: true,
      showSuccess: false,
      currentTxHashes: nextTxHashes,
      canSubmit: false
    };
  }

  if (status === "Mining") {
    return {
      state: isBridgeToExecuted ? "bridge_mining" : "approval_mining",
      statusLabel: isBridgeToExecuted
        ? "Bridge transaction submitted. Waiting for confirmation..."
        : "Transaction submitted. Waiting for confirmation...",
      isBusy: true,
      showSuccess: false,
      currentTxHashes: nextTxHashes,
      canSubmit: false
    };
  }

  if (status === "Success") {
    return {
      state: "success",
      statusLabel: "Bridge completed successfully!",
      isBusy: false,
      showSuccess: true,
      currentTxHashes: nextTxHashes,
      canSubmit: canSubmitInput && !hasFeeError
    };
  }

  if (status === "Fail" || status === "Exception") {
    if (isUserRejectionError(errorMessage)) {
      return {
        state: "cancelled",
        statusLabel: "Transaction cancelled",
        isBusy: false,
        showSuccess: false,
        currentTxHashes: nextTxHashes,
        canSubmit: canSubmitInput && !hasFeeError
      };
    }

    return {
      state: "failed",
      statusLabel: errorMessage || "Failed to bridge",
      isBusy: false,
      error: {
        code: "execution_failed",
        message: errorMessage || "Failed to bridge"
      },
      showSuccess: false,
      currentTxHashes: nextTxHashes,
      canSubmit: canSubmitInput && !hasFeeError
    };
  }

  return {
    state: "idle",
    statusLabel: "",
    isBusy: false,
    showSuccess: false,
    currentTxHashes: nextTxHashes,
    canSubmit: canSubmitInput && !hasFeeError
  };
};
