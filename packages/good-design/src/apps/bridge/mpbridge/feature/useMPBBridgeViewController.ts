import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { SupportedChains, deriveMPBBridgeFlowState } from "@gooddollar/web3sdk-v2";
import { ethers } from "ethers";

import type { MPBBridgeProps, BridgeProvider } from "../types";
import {
  useBridgeFees,
  useMPBBridgeEstimate,
  useChainBalances,
  useDebouncedTransactionHistory,
  useConvertedTransactionHistory
} from "../hooks";
import { capitalizeChain, getValidTargetChains } from "../utils";
import { handleSourceChainChange, handleProviderChange } from "../utils/chainHelpers";
import { createTransactionDetails } from "../utils/transactionHelpers";
import { useMPBBridgeUiState } from "./useMPBBridgeUiState";

const DEBOUNCE_MS = 300;
const TRANSACTION_HISTORY_DEBOUNCE_MS = 2000;

const FLOW_PENDING_STATES = new Set([
  "awaiting_network_switch",
  "awaiting_approval_signature",
  "approval_mining",
  "awaiting_bridge_signature",
  "bridge_mining"
]);

export interface MPBBridgeViewModel {
  modals: {
    txDetails: {
      shouldRender: boolean;
      props: {
        open: boolean;
        onClose: () => void;
        transaction: any;
        transactionHistory: any[];
      };
    };
    success: {
      open: boolean;
      onClose: () => void;
      data: any;
      onTrackTransaction: () => void;
    };
    error: {
      error: string;
      onClose: () => void;
      overlay: "dark";
    };
  };
  statusBanner: {
    shouldShow: boolean;
    isBridging: boolean;
    bridgingStatus: string;
  };
  feeErrorBanner: {
    shouldShow: boolean;
    message: string | null;
  };
  bridgeProviderSelectorProps: {
    bridgeProvider: BridgeProvider;
    onProviderChange: (provider: BridgeProvider) => void;
  };
  chainSelectorProps: {
    sourceChain: string;
    targetChain: string;
    showSourceDropdown: boolean;
    showTargetDropdown: boolean;
    bridgeFees: any;
    bridgeProvider: string;
    feesLoading: boolean;
    onSourceChainSelect: (chain: string) => void;
    onTargetChainSelect: (chain: string) => void;
    onSwap: () => void;
    onSourceDropdownToggle: () => void;
    onTargetDropdownToggle: () => void;
  };
  amountInputProps: {
    wei: string;
    gdValue: any;
    bridgeWeiAmount: string;
    setBridgeAmount: (amount: string) => void;
    minimumAmount: any;
    isValid: boolean;
    reason: any;
    balance: any;
    toggleState: boolean;
  };
  expectedOutputProps: {
    expectedToReceive: any;
    targetChain: string;
    balance: any;
  };
  actionButtonProps: {
    web3Action: () => Promise<void>;
    disabled: boolean;
    isLoading: boolean;
    text: string;
    supportedChains: number[];
    variant: "primary";
    size: "lg";
  };
  feeInformationProps: {
    sourceChain: string;
    targetChain: string;
    bridgeProvider: BridgeProvider;
    protocolFeePercent?: number;
    bridgeFees: any;
    feesLoading: boolean;
  };
  transactionHistoryProps: {
    realTransactionHistory: any[];
    historyLoading: boolean;
    onTxDetailsPress: (tx: any) => void;
  };
}

export const useMPBBridgeViewController = ({
  useCanMPBBridge,
  originChain,
  targetChainState,
  inputTransaction,
  pendingTransaction,
  protocolFeePercent,
  limits,
  fees,
  bridgeStatus,
  bridgeFlow,
  onBridgeStart,
  onBridgeFailed,
  onBridgeSuccess,
  bridgeProvider: propBridgeProvider,
  onBridgeProviderChange
}: MPBBridgeProps): MPBBridgeViewModel => {
  const [isBridging, setBridging] = useState(false);
  const [localBridgeProvider, setLocalBridgeProvider] = useState<BridgeProvider>("axelar");
  const bridgeProvider = propBridgeProvider || localBridgeProvider;
  const [bridgingStatus, setBridgingStatus] = useState<string>("");
  const [sourceChain, setSourceChain] = originChain;
  const [targetChain, setTargetChain] = targetChainState;
  const { fees: bridgeFees, loading: feesLoading, error: feesError } = useBridgeFees();

  const {
    showSourceDropdown,
    setShowSourceDropdown,
    showTargetDropdown,
    setShowTargetDropdown,
    toggleState,
    setToggleState,
    successModalOpen,
    setSuccessModalOpen,
    errorMessage,
    setErrorMessage,
    txDetailsOpen,
    txDetails,
    setTxDetails,
    setTxDetailsOpen,
    onTxDetailsPress,
    onTxDetailsClose,
    closeAllDropdowns
  } = useMPBBridgeUiState();

  const { realTransactionHistory, historyLoading } = useDebouncedTransactionHistory(TRANSACTION_HISTORY_DEBOUNCE_MS);
  const { getBalanceForChain } = useChainBalances();

  const gdValue = getBalanceForChain(sourceChain);
  const wei = gdValue.value.toString();
  const [bridgeWeiAmount, setBridgeAmount] = inputTransaction;
  const [pendingTxData, setPendingTransaction] = pendingTransaction;
  const [debouncedBridgeAmount, setDebouncedBridgeAmount] = useState(bridgeWeiAmount);

  const prevSourceChainRef = useRef(sourceChain);
  const successHandled = useRef(false);
  const cancelledHandled = useRef(false);
  const handledFailureMessage = useRef<string | undefined>();
  const previousFlowStateRef = useRef<string>("idle");
  const approveTxHashRef = useRef<string | undefined>();
  const bridgeToTxHashRef = useRef<string | undefined>();
  const lastBridgeModalTxHashRef = useRef<string | undefined>();
  const successModalDismissedRef = useRef(false);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBridgeAmount(bridgeWeiAmount), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [bridgeWeiAmount]);

  useEffect(() => {
    if (prevSourceChainRef.current !== sourceChain) {
      setDebouncedBridgeAmount(bridgeWeiAmount);
      prevSourceChainRef.current = sourceChain;
    }
  }, [sourceChain, bridgeWeiAmount]);

  const { isValid, reason } = useCanMPBBridge(sourceChain, debouncedBridgeAmount);
  const { minimumAmount, expectedToReceive, nativeFee } = useMPBBridgeEstimate({
    limits,
    fees,
    inputWei: debouncedBridgeAmount,
    sourceChain
  });

  const hasBalance = useMemo(
    () => ethers.BigNumber.from(debouncedBridgeAmount).lte(ethers.BigNumber.from(wei)),
    [debouncedBridgeAmount, wei]
  );
  const isValidInput = useMemo(() => isValid && hasBalance, [isValid, hasBalance]);

  const effectiveFlow = useMemo(
    () =>
      bridgeFlow ||
      deriveMPBBridgeFlowState({
        bridgeStatus,
        previousTxHashes: {
          approve: approveTxHashRef.current,
          bridgeTo: bridgeToTxHashRef.current
        },
        canSubmit: isValidInput,
        hasFeeError: Boolean(feesError)
      }),
    [bridgeFlow, bridgeStatus, isValidInput, feesError]
  );

  const clearStatusTimer = useCallback(() => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = undefined;
    }
  }, []);

  const handleBridgeProviderChangeCallback = useCallback(
    (provider: BridgeProvider) => {
      handleProviderChange(
        provider,
        sourceChain,
        targetChain,
        bridgeFees,
        feesLoading,
        setSourceChain,
        setTargetChain,
        onBridgeProviderChange,
        setLocalBridgeProvider
      );
      closeAllDropdowns();
    },
    [bridgeFees, feesLoading, sourceChain, targetChain, setSourceChain, onBridgeProviderChange, closeAllDropdowns]
  );

  useEffect(() => {
    let validTargets = getValidTargetChains(sourceChain as any, bridgeFees, bridgeProvider, feesLoading);
    if (validTargets.length === 0) {
      validTargets = getValidTargetChains(sourceChain as any, undefined as any, bridgeProvider, true);
    }
    if (validTargets.length > 0 && !validTargets.includes(targetChain as any)) {
      setTargetChain(validTargets[0]);
    }
  }, [bridgeProvider, sourceChain, bridgeFees, feesLoading, targetChain, setTargetChain]);

  const handleSwap = useCallback(() => {
    const newSourceChain = targetChain;
    const newTargetChain = sourceChain;
    setBridgeAmount("0");
    setToggleState(prevState => !prevState);
    setSourceChain(newSourceChain);
    setTargetChain(newTargetChain);
    closeAllDropdowns();
  }, [targetChain, sourceChain, setBridgeAmount, setSourceChain, setTargetChain, closeAllDropdowns]);

  const handleSourceChainSelect = useCallback(
    (chain: string) => {
      handleSourceChainChange(
        chain,
        bridgeProvider,
        bridgeFees,
        feesLoading,
        setSourceChain,
        setTargetChain,
        setBridgeAmount,
        setToggleState,
        handleBridgeProviderChangeCallback
      );
      closeAllDropdowns();
    },
    [
      bridgeProvider,
      bridgeFees,
      feesLoading,
      setBridgeAmount,
      setSourceChain,
      setTargetChain,
      handleBridgeProviderChangeCallback,
      closeAllDropdowns
    ]
  );

  const handleTargetChainSelect = useCallback(
    (chain: string) => {
      setTargetChain(chain);
      closeAllDropdowns();
    },
    [setTargetChain, closeAllDropdowns]
  );

  const resetBridgeState = useCallback(() => {
    approveTxHashRef.current = undefined;
    bridgeToTxHashRef.current = undefined;
    lastBridgeModalTxHashRef.current = undefined;
    successModalDismissedRef.current = false;
    successHandled.current = false;
    cancelledHandled.current = false;
    handledFailureMessage.current = undefined;
  }, []);

  const triggerBridge = useCallback(async () => {
    setBridging(true);
    setBridgingStatus("Initiating bridge transaction...");
    setPendingTransaction({ bridgeWeiAmount, expectedToReceive, nativeFee, bridgeProvider });
    resetBridgeState();
    void onBridgeStart?.(sourceChain, targetChain);
  }, [
    setPendingTransaction,
    onBridgeStart,
    bridgeWeiAmount,
    expectedToReceive,
    nativeFee,
    bridgeProvider,
    sourceChain,
    targetChain,
    resetBridgeState
  ]);

  useEffect(() => {
    const approveHash = effectiveFlow.currentTxHashes?.approve;
    const bridgeToHash = effectiveFlow.currentTxHashes?.bridgeTo;

    if (approveHash) {
      approveTxHashRef.current = approveHash;
    }

    if (bridgeToHash) {
      bridgeToTxHashRef.current = bridgeToHash;

      if (lastBridgeModalTxHashRef.current !== bridgeToHash) {
        lastBridgeModalTxHashRef.current = bridgeToHash;

        if (!successModalDismissedRef.current) {
          setSuccessModalOpen(true);
        }
      }
    }
  }, [effectiveFlow.currentTxHashes?.approve, effectiveFlow.currentTxHashes?.bridgeTo, setSuccessModalOpen]);

  useEffect(() => {
    const previousFlowState = previousFlowStateRef.current;
    previousFlowStateRef.current = effectiveFlow.state;

    if (effectiveFlow.state !== "success") {
      successHandled.current = false;
    }

    if (effectiveFlow.state !== "cancelled") {
      cancelledHandled.current = false;
    }

    if (effectiveFlow.state !== "failed") {
      handledFailureMessage.current = undefined;
    }

    clearStatusTimer();

    if (FLOW_PENDING_STATES.has(effectiveFlow.state)) {
      setBridging(true);
      setBridgingStatus(effectiveFlow.statusLabel);
      return;
    }

    if (effectiveFlow.state === "success" && !successHandled.current) {
      successHandled.current = true;
      setBridgingStatus(effectiveFlow.statusLabel || "Bridge completed successfully!");
      setBridging(false);

      if (!successModalOpen && !successModalDismissedRef.current) {
        setSuccessModalOpen(true);
      }

      statusTimerRef.current = setTimeout(() => {
        setBridgingStatus("");
      }, 3000);

      onBridgeSuccess?.();
      return;
    }

    if (effectiveFlow.state === "cancelled" && !cancelledHandled.current) {
      cancelledHandled.current = true;
      setSuccessModalOpen(false);
      setBridgingStatus(effectiveFlow.statusLabel || "Transaction cancelled");

      statusTimerRef.current = setTimeout(() => {
        setBridging(false);
        setBridgingStatus("");
      }, 2000);
      return;
    }

    if (effectiveFlow.state === "failed") {
      setSuccessModalOpen(false);
      setBridging(false);

      const errorMsg = effectiveFlow.error?.message || bridgeStatus?.errorMessage || "Failed to bridge";
      setErrorMessage(errorMsg);

      if (handledFailureMessage.current !== errorMsg) {
        handledFailureMessage.current = errorMsg;
        onBridgeFailed?.(new Error(errorMsg));
      }

      approveTxHashRef.current = undefined;
      bridgeToTxHashRef.current = undefined;
      lastBridgeModalTxHashRef.current = undefined;
      return;
    }

    if (effectiveFlow.state === "idle" && previousFlowState !== "idle") {
      setBridging(false);
      setBridgingStatus("");
    }
  }, [
    effectiveFlow.state,
    effectiveFlow.statusLabel,
    effectiveFlow.error?.message,
    bridgeStatus?.errorMessage,
    successModalOpen,
    onBridgeSuccess,
    onBridgeFailed,
    setBridging,
    setBridgingStatus,
    setSuccessModalOpen,
    setErrorMessage,
    clearStatusTimer
  ]);

  useEffect(
    () => () => {
      clearStatusTimer();
    },
    [clearStatusTimer]
  );

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSourceDropdown(false);
      setShowTargetDropdown(false);
    };

    if (showSourceDropdown || showTargetDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSourceDropdown, showTargetDropdown, setShowSourceDropdown, setShowTargetDropdown]);

  const recentTransactions = useConvertedTransactionHistory(realTransactionHistory, sourceChain);

  const successModalData = useMemo(
    () => ({
      bridgeProvider: pendingTxData?.bridgeProvider || bridgeProvider,
      sourceChain,
      targetChain,
      amount: pendingTxData?.bridgeWeiAmount || "0",
      protocolFeePercent,
      networkFee: fees?.[sourceChain]?.nativeFee,
      txHash: bridgeStatus?.transaction?.hash
    }),
    [pendingTxData, bridgeProvider, sourceChain, targetChain, protocolFeePercent, fees, bridgeStatus?.transaction?.hash]
  );

  const onCloseSuccessModal = useCallback(() => {
    setSuccessModalOpen(false);
    successModalDismissedRef.current = true;
  }, [setSuccessModalOpen]);

  const onTrackTransaction = useCallback(() => {
    setSuccessModalOpen(false);
    successModalDismissedRef.current = true;

    const transactionDetails = createTransactionDetails({
      amountWei: pendingTxData?.bridgeWeiAmount || "0",
      sourceChain,
      targetChain,
      bridgeProvider: pendingTxData?.bridgeProvider || bridgeProvider,
      bridgeStatus: bridgeStatus as any,
      bridgeToTxHash: bridgeToTxHashRef.current
    });

    setTxDetails(transactionDetails);
    setTxDetailsOpen(true);
  }, [
    pendingTxData,
    sourceChain,
    targetChain,
    bridgeProvider,
    bridgeStatus,
    setSuccessModalOpen,
    setTxDetails,
    setTxDetailsOpen
  ]);

  return {
    modals: {
      txDetails: {
        shouldRender: txDetailsOpen && !!txDetails,
        props: {
          open: txDetailsOpen,
          onClose: onTxDetailsClose,
          transaction: txDetails,
          transactionHistory: recentTransactions as any[]
        }
      },
      success: {
        open: successModalOpen,
        onClose: onCloseSuccessModal,
        data: successModalData,
        onTrackTransaction
      },
      error: {
        error: errorMessage,
        onClose: () => setErrorMessage(""),
        overlay: "dark"
      }
    },
    statusBanner: {
      shouldShow: isBridging,
      isBridging,
      bridgingStatus
    },
    feeErrorBanner: {
      shouldShow: Boolean(feesError),
      message: feesError
    },
    bridgeProviderSelectorProps: {
      bridgeProvider,
      onProviderChange: handleBridgeProviderChangeCallback
    },
    chainSelectorProps: {
      sourceChain,
      targetChain,
      showSourceDropdown,
      showTargetDropdown,
      bridgeFees,
      bridgeProvider,
      feesLoading,
      onSourceChainSelect: handleSourceChainSelect,
      onTargetChainSelect: handleTargetChainSelect,
      onSwap: handleSwap,
      onSourceDropdownToggle: () => setShowSourceDropdown(!showSourceDropdown),
      onTargetDropdownToggle: () => setShowTargetDropdown(!showTargetDropdown)
    },
    amountInputProps: {
      wei,
      gdValue,
      bridgeWeiAmount,
      setBridgeAmount,
      minimumAmount,
      isValid,
      reason: reason as any,
      balance: getBalanceForChain(sourceChain),
      toggleState
    },
    expectedOutputProps: {
      expectedToReceive,
      targetChain,
      balance: getBalanceForChain(targetChain)
    },
    actionButtonProps: {
      web3Action: triggerBridge,
      disabled: !isValidInput || isBridging || !!feesError,
      isLoading: isBridging,
      text: isBridging ? "Bridging..." : `Bridge to ${capitalizeChain(targetChain)} `,
      supportedChains: [SupportedChains[sourceChain.toUpperCase() as keyof typeof SupportedChains]],
      variant: "primary",
      size: "lg"
    },
    feeInformationProps: {
      sourceChain,
      targetChain,
      bridgeProvider,
      protocolFeePercent,
      bridgeFees,
      feesLoading
    },
    transactionHistoryProps: {
      realTransactionHistory: recentTransactions,
      historyLoading,
      onTxDetailsPress
    }
  };
};
