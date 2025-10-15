import React, { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { Box, Text, VStack } from "native-base";
import { SupportedChains } from "@gooddollar/web3sdk-v2";
import { ethers } from "ethers";

import { Web3ActionButton } from "../../../advanced";
import { MPBTransactionDetailsModal } from "./MPBTransactionDetailsModal";

import type { MPBBridgeProps, BridgeProvider } from "./types";
import {
  useBridgeFees,
  useMPBBridgeEstimate,
  useChainBalances,
  useDebouncedTransactionHistory,
  useConvertedTransactionHistory
} from "./hooks";
import { getValidTargetChains } from "./utils";
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
  inputTransaction,
  pendingTransaction,
  limits,
  fees,
  bridgeStatus,
  onBridgeStart,
  onBridgeFailed,
  onBridgeSuccess
}: MPBBridgeProps) => {
  const [isBridging, setBridging] = useState(false);
  const [bridgeProvider, setBridgeProvider] = useState<BridgeProvider>("axelar");

  // Wrapper function to close dropdowns when bridge provider changes
  const handleBridgeProviderChange = useCallback((provider: BridgeProvider) => {
    setBridgeProvider(provider);
    setShowSourceDropdown(false);
    setShowTargetDropdown(false);
  }, []);
  const [bridgingStatus, setBridgingStatus] = useState<string>("");
  const [sourceChain, setSourceChain] = originChain;
  const [targetChain, setTargetChain] = useState(
    sourceChain === "fuse" ? "celo" : sourceChain === "celo" ? "mainnet" : "fuse"
  );
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [toggleState, setToggleState] = useState<boolean>(false);

  const { fees: bridgeFees, loading: feesLoading } = useBridgeFees();

  const { realTransactionHistory, historyLoading } = useDebouncedTransactionHistory(2000);

  const { getBalanceForChain } = useChainBalances();

  const gdValue = getBalanceForChain(sourceChain);
  const wei = gdValue.value.toString();
  const [bridgeWeiAmount, setBridgeAmount] = inputTransaction;
  const [, setPendingTransaction] = pendingTransaction;

  // Debounce the bridge amount for validation and estimation
  const [debouncedBridgeAmount, setDebouncedBridgeAmount] = useState(bridgeWeiAmount);
  const prevSourceChainRef = useRef(sourceChain);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBridgeAmount(bridgeWeiAmount);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [bridgeWeiAmount]);

  // Force immediate update of debounced amount when source chain changes
  // This prevents validation mismatch after chain swap
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
    const validTargets = getValidTargetChains(sourceChain as any, bridgeFees, bridgeProvider, feesLoading);
    if (validTargets.length > 0 && !validTargets.includes(targetChain as any)) {
      setTargetChain(validTargets[0]);
    } else if (validTargets.length === 0 && bridgeProvider === "axelar" && sourceChain === "fuse") {
      setBridgeProvider("layerzero");
      setTargetChain("celo");
    }
  }, [bridgeProvider, sourceChain, bridgeFees, feesLoading, targetChain]);

  // Swap functionality - reset amount and input display to avoid decimal format mismatch
  const handleSwap = useCallback(() => {
    const newSourceChain = targetChain;
    const newTargetChain = sourceChain;

    // Reset amount to avoid decimal format mismatch between chains
    setBridgeAmount("0");
    // Toggle state to reset TokenInput display
    setToggleState(prevState => !prevState);
    setSourceChain(newSourceChain);
    setTargetChain(newTargetChain);
    setShowSourceDropdown(false);
    setShowTargetDropdown(false);
  }, [targetChain, sourceChain, setBridgeAmount]);

  // Handle source chain selection - reset amount and input display to avoid decimal format mismatch
  const handleSourceChainSelect = useCallback(
    (chain: string) => {
      // Reset amount to avoid decimal format mismatch when changing chains
      setBridgeAmount("0");
      // Toggle state to reset TokenInput display
      setToggleState(prevState => !prevState);
      setSourceChain(chain);
      // Reset target chain to first valid option based on current bridge provider
      const validTargets = getValidTargetChains(chain, bridgeFees, bridgeProvider, feesLoading);
      if (validTargets.length > 0) {
        setTargetChain(validTargets[0]);
      } else {
        // If no valid targets for current provider, switch to LayerZero (which supports more routes)
        if (bridgeProvider === "axelar") {
          setBridgeProvider("layerzero");
          // Set a default target for LayerZero
          if (chain === "fuse") {
            setTargetChain("celo");
          } else if (chain === "celo") {
            setTargetChain("mainnet");
          } else if (chain === "mainnet") {
            setTargetChain("celo");
          } else {
            setTargetChain("celo");
          }
        } else {
          setTargetChain("celo");
        }
      }
      setShowSourceDropdown(false);
      setShowTargetDropdown(false);
    },
    [bridgeProvider, bridgeFees, feesLoading, setBridgeAmount]
  );

  const handleTargetChainSelect = useCallback((chain: string) => {
    setTargetChain(chain);
    setShowTargetDropdown(false);
    setShowSourceDropdown(false);
  }, []);

  const triggerBridge = useCallback(async () => {
    setBridging(true);
    setBridgingStatus("Initiating bridge transaction...");
    setPendingTransaction({ bridgeWeiAmount, expectedToReceive, nativeFee, bridgeProvider });
    void onBridgeStart?.(sourceChain, targetChain);
  }, [
    setPendingTransaction,
    onBridgeStart,
    bridgeWeiAmount,
    expectedToReceive,
    nativeFee,
    bridgeProvider,
    sourceChain,
    targetChain
  ]);

  useEffect(() => {
    const { status = "" } = bridgeStatus ?? {};
    const isSuccess = status === "Success";
    const isFailed = ["Fail", "Exception"].includes(status);
    const isBridgingActive = !isFailed && !isSuccess && ["Mining", "PendingSignature", "Success"].includes(status);

    setBridging(isBridgingActive);

    if (bridgeStatus?.status === "Mining") {
      setBridgingStatus("Bridging in progress...");
    }

    if (bridgeStatus?.status === "PendingSignature") {
      setBridgingStatus("Waiting for signature...");
    }

    if (bridgeStatus?.status === "Success") {
      setBridgingStatus("Bridge completed successfully!");
      setTimeout(() => {
        setBridging(false);
        setBridgingStatus("");
      }, 3000);
      onBridgeSuccess?.();
    }

    if (isFailed) {
      setBridgingStatus("Bridge failed");
      setTimeout(() => {
        setBridging(false);
        setBridgingStatus("");
      }, 3000);
      const exception = new Error(bridgeStatus?.errorMessage ?? "Failed to bridge");
      onBridgeFailed?.(exception);
    }
  }, [bridgeStatus, onBridgeSuccess, onBridgeFailed]);

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

  return (
    <VStack space={8} alignSelf="center">
      {/* Transaction Details Modal */}
      {txDetailsOpen && txDetails ? (
        <MPBTransactionDetailsModal open={txDetailsOpen} onClose={onTxDetailsClose} transaction={txDetails} />
      ) : null}

      {/* Header */}
      <VStack space={3} alignItems="center">
        <Text fontFamily="heading" fontSize="4xl" fontWeight="700" color="goodBlue.600">
          Main Bridge
        </Text>
        <Text
          fontFamily="subheading"
          fontSize="md"
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
      <BridgingStatusBanner isBridging={isBridging} bridgingStatus={bridgingStatus} />

      {/* Bridge Functionality Card */}
      <Box borderRadius="xl" borderWidth="1" padding="8" backgroundColor="white" shadow="lg" borderColor="goodGrey.200">
        <VStack space={8}>
          {/* Bridge Provider Selection */}
          <BridgeProviderSelector bridgeProvider={bridgeProvider} onProviderChange={handleBridgeProviderChange} />

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
              disabled={!isValidInput || isBridging}
              isLoading={isBridging}
              text={
                isBridging ? "Bridging..." : `Bridge to ${targetChain.charAt(0).toUpperCase() + targetChain.slice(1)}`
              }
              supportedChains={[SupportedChains[sourceChain.toUpperCase() as keyof typeof SupportedChains]]}
              variant="primary"
              size="lg"
            />

            {/* Fee Information */}
            <FeeInformation
              minimumAmount={minimumAmount}
              sourceChain={sourceChain}
              targetChain={targetChain}
              bridgeProvider={bridgeProvider}
              bridgeFees={bridgeFees}
              feesLoading={feesLoading}
            />

            {/* Recent Transactions */}
            <TransactionHistory
              realTransactionHistory={recentTransactions}
              historyLoading={historyLoading}
              onTxDetailsPress={onTxDetailsPress}
            />
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
};
