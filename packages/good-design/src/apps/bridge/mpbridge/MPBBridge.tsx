import React, { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { Box, Text, VStack } from "native-base";
import { Platform } from "react-native";
import { SupportedChains } from "@gooddollar/web3sdk-v2";
import { ethers } from "ethers";

import { Web3ActionButton } from "../../../advanced";
import { MPBTransactionDetailsModal } from "./MPBTransactionDetailsModal";
import { BridgeSuccessModal } from "./BridgeSuccessModal";
import { ErrorModal } from "../../../core/web3/modals/ErrorModal";

import type { MPBBridgeProps, BridgeProvider } from "./types";
import {
  useBridgeFees,
  useMPBBridgeEstimate,
  useChainBalances,
  useDebouncedTransactionHistory,
  useConvertedTransactionHistory,
  useBridgeStatusHandler
} from "./hooks";
import { getValidTargetChains } from "./utils";
import { handleSourceChainChange, handleProviderChange } from "./utils/chainHelpers";
import { createTransactionDetails } from "./utils/transactionHelpers";
import { ChainSelector } from "./ChainSelector";
import { BridgeProviderSelector } from "./BridgeProviderSelector";
import { AmountInput } from "./AmountInput";
import { ExpectedOutput } from "./ExpectedOutput";
import { FeeInformation } from "./FeeInformation";
import { TransactionHistory } from "./TransactionHistory";
import { BridgingStatusBanner } from "./BridgingStatusBanner";

export const MPBBridge = ({
  useCanMPBBridge,
  originChain,
  targetChainState,
  inputTransaction,
  pendingTransaction,
  protocolFeePercent,
  limits,
  fees,
  bridgeStatus,
  onBridgeStart,
  onBridgeFailed,
  onBridgeSuccess,
  bridgeProvider: propBridgeProvider,
  onBridgeProviderChange
}: MPBBridgeProps) => {
  const [isBridging, setBridging] = useState(false);
  const [localBridgeProvider, setLocalBridgeProvider] = useState<BridgeProvider>("axelar");
  const bridgeProvider = propBridgeProvider || localBridgeProvider;
  const [bridgingStatus, setBridgingStatus] = useState<string>("");
  const [sourceChain, setSourceChain] = originChain;
  const [targetChain, setTargetChain] = targetChainState;
  const { fees: bridgeFees, loading: feesLoading, error: feesError } = useBridgeFees();
  const [errorMessage, setErrorMessage] = useState("");

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
      setShowSourceDropdown(false);
      setShowTargetDropdown(false);
    },
    [bridgeFees, feesLoading, sourceChain, targetChain, setSourceChain, onBridgeProviderChange]
  );
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [toggleState, setToggleState] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const { realTransactionHistory, historyLoading } = useDebouncedTransactionHistory(2000);

  const { getBalanceForChain } = useChainBalances();

  const gdValue = getBalanceForChain(sourceChain);
  const wei = gdValue.value.toString();
  const [bridgeWeiAmount, setBridgeAmount] = inputTransaction;
  const [, setPendingTransaction] = pendingTransaction;
  const [debouncedBridgeAmount, setDebouncedBridgeAmount] = useState(bridgeWeiAmount);
  const prevSourceChainRef = useRef(sourceChain);
  const successHandled = useRef(false);
  const approveTxHashRef = useRef<string | undefined>();
  const bridgeToTxHashRef = useRef<string | undefined>();
  const successModalDismissedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBridgeAmount(bridgeWeiAmount);
    }, 300); // 300ms debounce

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

  useEffect(() => {
    let validTargets = getValidTargetChains(sourceChain as any, bridgeFees, bridgeProvider, feesLoading);
    if (validTargets.length === 0) {
      validTargets = getValidTargetChains(sourceChain as any, undefined as any, bridgeProvider, true);
    }
    if (validTargets.length > 0 && !validTargets.includes(targetChain as any)) {
      setTargetChain(validTargets[0]);
    }
  }, [bridgeProvider, sourceChain, bridgeFees, feesLoading, targetChain]);
  const handleSwap = useCallback(() => {
    const newSourceChain = targetChain;
    const newTargetChain = sourceChain;
    setBridgeAmount("0");
    setToggleState(prevState => !prevState);
    setSourceChain(newSourceChain);
    setTargetChain(newTargetChain);
    setShowSourceDropdown(false);
    setShowTargetDropdown(false);
  }, [targetChain, sourceChain, setBridgeAmount]);

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
      setShowSourceDropdown(false);
      setShowTargetDropdown(false);
    },
    [bridgeProvider, bridgeFees, feesLoading, setBridgeAmount, handleBridgeProviderChangeCallback]
  );

  const handleTargetChainSelect = useCallback((chain: string) => {
    setTargetChain(chain);
    setShowTargetDropdown(false);
    setShowSourceDropdown(false);
  }, []);

  const resetBridgeState = useCallback(() => {
    approveTxHashRef.current = undefined;
    bridgeToTxHashRef.current = undefined;
    successModalDismissedRef.current = false;
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

  useBridgeStatusHandler(
    {
      bridgeStatus: bridgeStatus as any,
      onBridgeSuccess,
      onBridgeFailed,
      setBridging,
      setBridgingStatus,
      setSuccessModalOpen,
      setErrorMessage,
      successModalOpen
    },
    {
      successHandled,
      approveTxHash: approveTxHashRef,
      bridgeToTxHash: bridgeToTxHashRef,
      successModalDismissed: successModalDismissedRef
    }
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
  }, [showSourceDropdown, showTargetDropdown]);

  // Convert real transaction history to the format expected by TransactionList
  const recentTransactions = useConvertedTransactionHistory(realTransactionHistory, sourceChain);

  // Tx details modal state
  const [txDetailsOpen, setTxDetailsOpen] = useState(false);
  const [txDetails, setTxDetails] = useState<any | undefined>();
  const onTxDetailsPress = useCallback((tx: any) => {
    setTxDetails(tx);
    setTxDetailsOpen(true);
  }, []);
  const onTxDetailsClose = useCallback(() => setTxDetailsOpen(false), []);

  const [pendingTxData] = pendingTransaction;

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

  return (
    <VStack space={8} alignSelf="center">
      {/* Transaction Details Modal */}
      {txDetailsOpen && txDetails ? (
        <MPBTransactionDetailsModal
          open={txDetailsOpen}
          onClose={onTxDetailsClose}
          transaction={txDetails}
          transactionHistory={recentTransactions as any}
        />
      ) : null}

      <BridgeSuccessModal
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          successModalDismissedRef.current = true;
        }}
        data={successModalData}
        onTrackTransaction={() => {
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
        }}
      />

      {/* Error Modal */}
      <ErrorModal error={errorMessage} onClose={() => setErrorMessage("")} overlay="dark" />

      {/* Header */}
      <VStack space={3} alignItems="center">
        <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="goodBlue.600">
          Main Bridge
        </Text>
        <Text
          fontFamily="subheading"
          fontSize="xs"
          color="goodGrey.100"
          textAlign="center"
          maxWidth="600"
          lineHeight="lg"
        >
          Seamlessly convert between Fuse G$ tokens to Celo and vice versa, enabling versatile use of G$ tokens across
          various platforms and ecosystems.
        </Text>
      </VStack>

      {/* Bridging Status Banner */}
      {isBridging && <BridgingStatusBanner isBridging={isBridging} bridgingStatus={bridgingStatus} />}

      {/* Fee Error Banner */}
      {feesError && (
        <Box bg="red.50" borderRadius="lg" padding="4" borderWidth="1" borderColor="red.300">
          <Text color="red.600" fontSize="sm" fontWeight="500">
            {feesError}
          </Text>
        </Box>
      )}

      {/* Bridge Functionality Card */}
      <Box
        borderRadius="xl"
        padding="8"
        backgroundColor="white"
        style={Platform.select({
          web: {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)"
          },
          default: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 8
          }
        })}
      >
        <VStack space={8}>
          <BridgeProviderSelector
            bridgeProvider={bridgeProvider}
            onProviderChange={handleBridgeProviderChangeCallback}
          />

          {/* Token Exchange Interface */}
          <VStack space={6}>
            {/* Token Selection Row */}
            <ChainSelector
              sourceChain={sourceChain}
              targetChain={targetChain}
              showSourceDropdown={showSourceDropdown}
              showTargetDropdown={showTargetDropdown}
              bridgeFees={bridgeFees}
              bridgeProvider={bridgeProvider}
              feesLoading={feesLoading}
              onSourceChainSelect={handleSourceChainSelect}
              onTargetChainSelect={handleTargetChainSelect}
              onSwap={handleSwap}
              onSourceDropdownToggle={() => setShowSourceDropdown(!showSourceDropdown)}
              onTargetDropdownToggle={() => setShowTargetDropdown(!showTargetDropdown)}
            />

            {/* Amount Input */}
            <AmountInput
              wei={wei}
              gdValue={gdValue}
              bridgeWeiAmount={bridgeWeiAmount}
              setBridgeAmount={setBridgeAmount}
              minimumAmount={minimumAmount}
              isValid={isValid}
              reason={reason as any}
              balance={getBalanceForChain(sourceChain)}
              toggleState={toggleState}
            />

            {/* Expected Output */}
            <ExpectedOutput
              expectedToReceive={expectedToReceive}
              targetChain={targetChain}
              balance={getBalanceForChain(targetChain)}
            />

            {/* Bridge Button */}
            <Web3ActionButton
              web3Action={triggerBridge}
              disabled={!isValidInput || isBridging || !!feesError}
              isLoading={isBridging}
              text={
                isBridging ? "Bridging..." : `Bridge to ${targetChain.charAt(0).toUpperCase() + targetChain.slice(1)} `
              }
              supportedChains={[SupportedChains[sourceChain.toUpperCase() as keyof typeof SupportedChains]]}
              variant="primary"
              size="lg"
            />

            {/* Fee Information */}
            <FeeInformation
              sourceChain={sourceChain}
              targetChain={targetChain}
              bridgeProvider={bridgeProvider}
              protocolFeePercent={protocolFeePercent}
              bridgeFees={bridgeFees}
              feesLoading={feesLoading}
            />
          </VStack>
        </VStack>
      </Box>

      {/* Transaction History Card */}
      <Box
        borderRadius="xl"
        padding="8"
        backgroundColor="white"
        style={Platform.select({
          web: {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)"
          },
          default: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 8
          }
        })}
      >
        <TransactionHistory
          realTransactionHistory={recentTransactions}
          historyLoading={historyLoading}
          onTxDetailsPress={onTxDetailsPress}
        />
      </Box>
    </VStack>
  );
};
