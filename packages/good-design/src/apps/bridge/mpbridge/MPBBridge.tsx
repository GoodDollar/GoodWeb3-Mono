import React, { useEffect, useCallback, useState } from "react";
import { Box, HStack, Pressable, Spinner, ChevronDownIcon, Text, VStack, Input } from "native-base";
import { CurrencyValue } from "@usedapp/core";
import { SupportedChains, useG$Amounts, useG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { ethers } from "ethers";

import { Web3ActionButton } from "../../../advanced";
import { TokenInput } from "../../../core";
import { BigNumber } from "ethers";

import type { IMPBFees, IMPBLimits, MPBBridgeProps, BridgeProvider } from "./types";
import { fetchBridgeFees } from "@gooddollar/web3sdk-v2";

// Hook to get real bridge fees
const useBridgeFees = () => {
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBridgeFees()
      .then(feesData => {
        setFees(feesData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching bridge fees:", error);
        setLoading(false);
      });
  }, []);

  return { fees, loading };
};

const useMPBBridgeEstimate = ({
  limits,
  fees,
  sourceChain,
  inputWei
}: {
  limits?: IMPBLimits;
  fees?: IMPBFees;
  sourceChain: string;
  inputWei: string;
}): {
  expectedFee: CurrencyValue;
  expectedToReceive: CurrencyValue;
  minimumAmount: CurrencyValue;
  maximumAmount: CurrencyValue;
  bridgeFee: CurrencyValue;
  nativeFee: CurrencyValue;
  zroFee: CurrencyValue;
} => {
  const chain = sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122;
  const { defaultEnv } = useGetEnvChainId(chain);

  const { minimumAmount, maximumAmount, bridgeFee, input } = useG$Amounts(
    {
      minimumAmount: limits?.[sourceChain]?.minAmount,
      maximumAmount: limits?.[sourceChain]?.maxAmount,
      bridgeFee: fees?.[sourceChain]?.nativeFee,
      minFee: fees?.[sourceChain]?.nativeFee,
      maxFee: fees?.[sourceChain]?.nativeFee,
      input: BigNumber.from(inputWei)
    },
    "G$",
    chain
  );

  // For MPB, the fee is the native fee from LayerZero/Axelar
  const expectedFee = fees?.[sourceChain]?.nativeFee
    ? G$Amount("G$", fees[sourceChain].nativeFee, chain, defaultEnv)
    : G$Amount("G$", BigNumber.from(0), chain, defaultEnv);

  // The fee is paid in the native token (CELO, ETH, etc.), not in G$
  const expectedToReceive = input;

  return {
    expectedFee,
    expectedToReceive,
    minimumAmount,
    maximumAmount,
    bridgeFee,
    nativeFee: expectedFee,
    zroFee: fees?.[sourceChain]?.zroFee
      ? G$Amount("G$", fees[sourceChain].zroFee, chain, defaultEnv)
      : G$Amount("G$", BigNumber.from(0), chain, defaultEnv)
  };
};

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
  const [bridgingStatus, setBridgingStatus] = useState<string>("");
  const [sourceChain, setSourceChain] = originChain;
  const [targetChain, setTargetChain] = useState(
    sourceChain === "fuse" ? "celo" : sourceChain === "celo" ? "mainnet" : "fuse"
  );
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Get real bridge fees
  const { fees: bridgeFees, loading: feesLoading } = useBridgeFees();

  // Query balances every 5 blocks, so balance is updated after bridging
  const { G$: fuseBalance } = useG$Balance(5, 122);
  const { G$: celoBalance } = useG$Balance(5, 42220);
  const { G$: mainnetBalance } = useG$Balance(5, 1);

  const getBalanceForChain = (chain: string) => {
    switch (chain) {
      case "fuse":
        return fuseBalance;
      case "celo":
        return celoBalance;
      case "mainnet":
        return mainnetBalance;
      default:
        return fuseBalance;
    }
  };

  const gdValue = getBalanceForChain(sourceChain);
  const wei = gdValue.value.toString();
  const [bridgeWeiAmount, setBridgeAmount] = inputTransaction;
  const [, setPendingTransaction] = pendingTransaction;
  const { isValid, reason } = useCanMPBBridge(sourceChain, bridgeWeiAmount);
  const { minimumAmount, expectedToReceive, nativeFee } = useMPBBridgeEstimate({
    limits,
    fees,
    inputWei: bridgeWeiAmount,
    sourceChain
  });

  const hasBalance = ethers.BigNumber.from(bridgeWeiAmount).lte(ethers.BigNumber.from(wei));
  const isValidInput = isValid && hasBalance;

  // Debug logging
  console.log("MPBBridge validation debug:", {
    bridgeWeiAmount,
    wei,
    isValid,
    reason,
    hasBalance,
    isValidInput,
    minimumAmount: minimumAmount?.toString(),
    sourceChain
  });

  // Get valid target chains for the selected source chain based on available bridge fees
  const getValidTargetChains = (source: string) => {
    if (!bridgeFees || feesLoading) {
      // Fallback to default valid chains if fees are not loaded yet
      switch (source) {
        case "fuse":
          return ["celo", "mainnet"];
        case "celo":
          return ["fuse", "mainnet"];
        case "mainnet":
          return ["fuse", "celo"];
        default:
          return ["celo", "mainnet"];
      }
    }

    const validTargets: string[] = [];
    const sourceUpper = source.toUpperCase();

    // Check Axelar fees - only Celo ↔ Mainnet
    if (bridgeProvider === "axelar" && bridgeFees.AXELAR) {
      const axelarFees = bridgeFees.AXELAR;
      if (sourceUpper === "CELO" && axelarFees.AXL_CELO_TO_ETH) {
        validTargets.push("mainnet");
      }
      if (sourceUpper === "MAINNET" && axelarFees.AXL_ETH_TO_CELO) {
        validTargets.push("celo");
      }
      // Axelar only supports Celo ↔ Mainnet, so return only these options
      return validTargets;
    }

    // Check LayerZero fees - all combinations
    if (bridgeProvider === "layerzero" && bridgeFees.LAYERZERO) {
      const layerzeroFees = bridgeFees.LAYERZERO;
      if (sourceUpper === "MAINNET") {
        if (layerzeroFees.LZ_ETH_TO_CELO) validTargets.push("celo");
        if (layerzeroFees.LZ_ETH_TO_FUSE) validTargets.push("fuse");
      }
      if (sourceUpper === "CELO") {
        if (layerzeroFees.LZ_CELO_TO_ETH) validTargets.push("mainnet");
        if (layerzeroFees.LZ_CELO_TO_FUSE) validTargets.push("fuse");
      }
      if (sourceUpper === "FUSE") {
        if (layerzeroFees.LZ_FUSE_TO_ETH) validTargets.push("mainnet");
        if (layerzeroFees.LZ_FUSE_TO_CELO) validTargets.push("celo");
      }
      return validTargets;
    }

    // If no valid targets found for current provider, return empty array
    return validTargets;
  };

  // Update target chain when bridge provider changes
  useEffect(() => {
    const validTargets = getValidTargetChains(sourceChain);
    if (validTargets.length > 0 && !validTargets.includes(targetChain)) {
      setTargetChain(validTargets[0]);
    } else if (validTargets.length === 0) {
      // If no valid targets for current provider, switch to LayerZero
      if (bridgeProvider === "axelar" && sourceChain === "fuse") {
        setBridgeProvider("layerzero");
        setTargetChain("celo");
      }
    }
  }, [bridgeProvider, sourceChain, targetChain]);

  // Swap functionality
  const handleSwap = useCallback(() => {
    const newSourceChain = targetChain;
    const newTargetChain = sourceChain;
    setSourceChain(newSourceChain);
    setTargetChain(newTargetChain);
    setShowSourceDropdown(false);
    setShowTargetDropdown(false);
  }, [targetChain, sourceChain]);

  // Handle source chain selection
  const handleSourceChainSelect = useCallback(
    (chain: string) => {
      setSourceChain(chain);
      // Reset target chain to first valid option based on current bridge provider
      const validTargets = getValidTargetChains(chain);
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
    },
    [bridgeProvider]
  );

  // Handle target chain selection
  const handleTargetChainSelect = useCallback((chain: string) => {
    setTargetChain(chain);
    setShowTargetDropdown(false);
  }, []);

  // Get current bridge fee for display
  const getCurrentBridgeFee = () => {
    if (!bridgeFees || feesLoading) return "Loading...";

    const sourceUpper = sourceChain.toUpperCase();
    const targetUpper = targetChain.toUpperCase();

    if (bridgeProvider === "axelar") {
      const axelarFees = bridgeFees.AXELAR;
      if (sourceUpper === "CELO" && targetUpper === "MAINNET" && axelarFees.AXL_CELO_TO_ETH) {
        return axelarFees.AXL_CELO_TO_ETH;
      }
      if (sourceUpper === "MAINNET" && targetUpper === "CELO" && axelarFees.AXL_ETH_TO_CELO) {
        return axelarFees.AXL_ETH_TO_CELO;
      }
    } else if (bridgeProvider === "layerzero") {
      const layerzeroFees = bridgeFees.LAYERZERO;
      if (sourceUpper === "MAINNET" && targetUpper === "CELO" && layerzeroFees.LZ_ETH_TO_CELO) {
        return layerzeroFees.LZ_ETH_TO_CELO;
      }
      if (sourceUpper === "MAINNET" && targetUpper === "FUSE" && layerzeroFees.LZ_ETH_TO_FUSE) {
        return layerzeroFees.LZ_ETH_TO_FUSE;
      }
      if (sourceUpper === "CELO" && targetUpper === "MAINNET" && layerzeroFees.LZ_CELO_TO_ETH) {
        return layerzeroFees.LZ_CELO_TO_ETH;
      }
      if (sourceUpper === "CELO" && targetUpper === "FUSE" && layerzeroFees.LZ_CELO_TO_FUSE) {
        return layerzeroFees.LZ_CELO_TO_FUSE;
      }
      if (sourceUpper === "FUSE" && targetUpper === "MAINNET" && layerzeroFees.LZ_FUSE_TO_ETH) {
        return layerzeroFees.LZ_FUSE_TO_ETH;
      }
      if (sourceUpper === "FUSE" && targetUpper === "CELO" && layerzeroFees.LZ_FUSE_TO_CELO) {
        return layerzeroFees.LZ_FUSE_TO_CELO;
      }
    }

    return "Fee not available";
  };

  const triggerBridge = useCallback(async () => {
    setBridging(true);
    setBridgingStatus("Initiating bridge transaction...");
    setPendingTransaction({ bridgeWeiAmount, expectedToReceive, nativeFee, bridgeProvider });
    onBridgeStart?.();
  }, [setPendingTransaction, onBridgeStart, bridgeWeiAmount, expectedToReceive, nativeFee, bridgeProvider]);

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

  // Close dropdowns when clicking outside
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

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case "celo":
        return "C";
      case "fuse":
        return "F";
      case "mainnet":
        return "E";
      default:
        return "?";
    }
  };

  const getChainColor = (chain: string) => {
    switch (chain) {
      case "celo":
        return "green.500";
      case "fuse":
        return "blue.500";
      case "mainnet":
        return "red.500";
      default:
        return "gray.500";
    }
  };

  const getChainLabel = (chain: string) => {
    switch (chain) {
      case "celo":
        return "G$ Celo";
      case "fuse":
        return "G$ Fuse";
      case "mainnet":
        return "G$ Ethereum";
      default:
        return "G$ Unknown";
    }
  };

  const availableChains = ["fuse", "celo", "mainnet"];

  return (
    <VStack space={8} alignSelf="center" maxWidth="800">
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
      {isBridging && (
        <Box borderRadius="lg" padding={4} backgroundColor="goodBlue.100" borderWidth="1" borderColor="goodBlue.300">
          <HStack space={3} alignItems="center">
            <Spinner size="sm" color="goodBlue.500" />
            <Text color="goodBlue.700" fontSize="sm" fontWeight="500">
              {bridgingStatus}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Bridge Functionality Card */}
      <Box borderRadius="xl" borderWidth="1" padding="8" backgroundColor="white" shadow="lg" borderColor="goodGrey.200">
        <VStack space={8}>
          {/* Bridge Provider Selection */}
          <VStack space={4}>
            <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="goodGrey.800">
              Select Bridge Provider
            </Text>
            <HStack space={4}>
              <Pressable
                flex={1}
                onPress={() => setBridgeProvider("axelar")}
                bg={bridgeProvider === "axelar" ? "rgb(59, 130, 246)" : "goodGrey.100"}
                borderRadius="lg"
                padding={5}
                alignItems="center"
                borderWidth={bridgeProvider === "axelar" ? 2 : 1}
                borderColor={bridgeProvider === "axelar" ? "rgb(59, 130, 246)" : "goodGrey.300"}
              >
                <Text color={bridgeProvider === "axelar" ? "white" : "goodGrey.700"} fontWeight="600" fontSize="lg">
                  Axelar
                </Text>
              </Pressable>
              <Pressable
                flex={1}
                onPress={() => setBridgeProvider("layerzero")}
                bg={bridgeProvider === "layerzero" ? "rgb(59, 130, 246)" : "goodGrey.100"}
                borderRadius="lg"
                padding={5}
                alignItems="center"
                borderWidth={bridgeProvider === "layerzero" ? 2 : 1}
                borderColor={bridgeProvider === "layerzero" ? "rgb(59, 130, 246)" : "goodGrey.300"}
              >
                <Text color={bridgeProvider === "layerzero" ? "white" : "goodGrey.700"} fontWeight="600" fontSize="lg">
                  LayerZero
                </Text>
              </Pressable>
            </HStack>
          </VStack>

          {/* Token Exchange Interface */}
          <VStack space={6}>
            {/* Token Selection Row */}
            <HStack space={4} alignItems="center" zIndex={1000}>
              {/* Source Chain */}
              <VStack
                flex={1}
                bg="white"
                borderRadius="lg"
                padding={2}
                borderWidth="1"
                borderColor="goodGrey.300"
                position="relative"
                style={{ overflow: "visible" }}
              >
                <HStack space={3} alignItems="center">
                  <Box
                    bg={getChainColor(sourceChain)}
                    borderRadius="full"
                    width="8"
                    height="8"
                    alignItems="center"
                    justifyContent="center"
                    shadow="sm"
                  >
                    <Text color="white" fontSize="sm" fontWeight="bold">
                      {getChainIcon(sourceChain)}
                    </Text>
                  </Box>
                  <Pressable
                    flex={1}
                    onPress={() => setShowSourceDropdown(!showSourceDropdown)}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="goodGrey.700" fontSize="md" fontWeight="600">
                      {getChainLabel(sourceChain)}
                    </Text>
                    <Box style={{ transform: [{ rotate: showSourceDropdown ? "180deg" : "0deg" }] }}>
                      <ChevronDownIcon size="sm" color="goodGrey.400" />
                    </Box>
                  </Pressable>
                </HStack>

                {/* Source Chain Dropdown */}
                {showSourceDropdown && (
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    bg="white"
                    borderRadius="lg"
                    borderWidth="1"
                    borderColor="goodGrey.300"
                    shadow="xl"
                    zIndex={999999}
                    mt={1}
                    minWidth="200px"
                    maxWidth="300px"
                    style={{
                      position: "absolute",
                      zIndex: 999999,
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      backgroundColor: "white",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      minWidth: "200px",
                      maxWidth: "300px"
                    }}
                  >
                    {availableChains.map(chain => (
                      <Pressable
                        key={chain}
                        onPress={() => handleSourceChainSelect(chain)}
                        padding={4}
                        borderBottomWidth={chain === availableChains[availableChains.length - 1] ? 0 : 1}
                        borderBottomColor="goodGrey.200"
                        _pressed={{ bg: "goodGrey.100" }}
                      >
                        <HStack space={3} alignItems="center">
                          <Box
                            bg={getChainColor(chain)}
                            borderRadius="full"
                            width="6"
                            height="6"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text color="white" fontSize="xs" fontWeight="bold">
                              {getChainIcon(chain)}
                            </Text>
                          </Box>
                          <Text color="goodGrey.700" fontSize="md" fontWeight="500">
                            {getChainLabel(chain)}
                          </Text>
                        </HStack>
                      </Pressable>
                    ))}
                  </Box>
                )}
              </VStack>

              {/* Swap Arrow */}
              <Pressable
                onPress={handleSwap}
                bg="goodGrey.200"
                borderRadius="full"
                width="8"
                height="8"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
                _pressed={{ bg: "goodGrey.300" }}
              >
                <Text fontSize="xl" color="goodGrey.600" fontWeight="bold">
                  ⇄
                </Text>
              </Pressable>

              {/* Target Chain */}
              <VStack
                bg="white"
                borderRadius="lg"
                padding={2}
                borderWidth="1"
                borderColor="goodGrey.300"
                flex={1}
                position="relative"
                style={{ overflow: "visible" }}
              >
                <HStack space={3} alignItems="center">
                  <Box
                    bg={getChainColor(targetChain)}
                    borderRadius="full"
                    width="8"
                    height="8"
                    alignItems="center"
                    justifyContent="center"
                    shadow="sm"
                  >
                    <Text color="white" fontSize="sm" fontWeight="bold">
                      {getChainIcon(targetChain)}
                    </Text>
                  </Box>
                  <Pressable
                    flex={1}
                    onPress={() => setShowTargetDropdown(!showTargetDropdown)}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="goodGrey.700" fontSize="md" fontWeight="600">
                      {getChainLabel(targetChain)}
                    </Text>
                    <Box style={{ transform: [{ rotate: showTargetDropdown ? "180deg" : "0deg" }] }}>
                      <ChevronDownIcon size="sm" color="goodGrey.400" />
                    </Box>
                  </Pressable>
                </HStack>

                {/* Target Chain Dropdown */}
                {showTargetDropdown && (
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    bg="white"
                    borderRadius="lg"
                    borderWidth="1"
                    borderColor="goodGrey.300"
                    shadow="xl"
                    zIndex={999999}
                    mt={1}
                    minWidth="200px"
                    maxWidth="300px"
                    style={{
                      position: "absolute",
                      zIndex: 999999,
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      backgroundColor: "white",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      minWidth: "200px",
                      maxWidth: "300px"
                    }}
                  >
                    {getValidTargetChains(sourceChain).map(chain => (
                      <Pressable
                        key={chain}
                        onPress={() => handleTargetChainSelect(chain)}
                        padding={4}
                        borderBottomWidth={chain === getValidTargetChains(sourceChain).slice(-1)[0] ? 0 : 1}
                        borderBottomColor="goodGrey.200"
                        _pressed={{ bg: "goodGrey.100" }}
                      >
                        <HStack space={3} alignItems="center">
                          <Box
                            bg={getChainColor(chain)}
                            borderRadius="full"
                            width="6"
                            height="6"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text color="white" fontSize="xs" fontWeight="bold">
                              {getChainIcon(chain)}
                            </Text>
                          </Box>
                          <Text color="goodGrey.700" fontSize="md" fontWeight="500">
                            {getChainLabel(chain)}
                          </Text>
                        </HStack>
                      </Pressable>
                    ))}
                  </Box>
                )}
              </VStack>
            </HStack>

            {/* Amount Input */}
            <VStack space={3}>
              <Text fontFamily="subheading" fontSize="md" color="goodGrey.600" fontWeight="600">
                Amount to send
              </Text>
              <TokenInput
                balanceWei={wei}
                onChange={setBridgeAmount}
                gdValue={gdValue}
                minAmountWei={minimumAmount?.toString()}
              />
              {!isValid && bridgeWeiAmount && (
                <Text color="red.500" fontSize="sm" fontWeight="500">
                  {reason === "minAmount"
                    ? " Minimum amount is " +
                      (Number(minimumAmount) / (sourceChain === "fuse" ? 1e2 : 1e18)).toFixed(2) +
                      " G$"
                    : undefined}
                </Text>
              )}
            </VStack>

            {/* Expected Output */}
            <VStack space={3}>
              <Text fontFamily="subheading" fontSize="md" color="goodGrey.600" fontWeight="600">
                You will receive on {targetChain.toUpperCase()}
              </Text>
              <Input
                value={expectedToReceive ? expectedToReceive.format() : "0"}
                isReadOnly
                borderRadius="lg"
                borderColor="goodGrey.300"
                bg="goodGrey.50"
                fontSize="md"
                padding={2}
                fontWeight="500"
              />
            </VStack>

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
            <VStack space={2} padding={4} bg="goodGrey.50" borderRadius="lg" borderWidth="1" borderColor="goodGrey.200">
              <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
                Minimum amount to bridge: {(Number(minimumAmount) / (sourceChain === "fuse" ? 1e2 : 1e18)).toFixed(2)}{" "}
                G$
              </Text>
              <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
                Bridge Fee: {getCurrentBridgeFee()}
              </Text>
              <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
                Provider: {bridgeProvider.charAt(0).toUpperCase() + bridgeProvider.slice(1)}
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
};
