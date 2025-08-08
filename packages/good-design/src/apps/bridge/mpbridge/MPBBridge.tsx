import React, { useEffect, useCallback, useState } from "react";
import { Box, HStack, Pressable, Spinner, Text, VStack, Select, Input } from "native-base";
import { CurrencyValue } from "@usedapp/core";
import { SupportedChains, useG$Amounts, useG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";

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

  const expectedToReceive = input.sub(expectedFee);

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
  const targetChain = sourceChain === "fuse" ? "celo" : sourceChain === "celo" ? "mainnet" : "fuse";

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
  const { isValid } = useCanMPBBridge(sourceChain, bridgeWeiAmount);
  const { minimumAmount, expectedToReceive, nativeFee } = useMPBBridgeEstimate({
    limits,
    fees,
    inputWei: bridgeWeiAmount,
    sourceChain
  });

  const hasBalance = Number(bridgeWeiAmount) <= Number(wei);
  const isValidInput = isValid && hasBalance;

  // Get current bridge fee for display
  const getCurrentBridgeFee = () => {
    if (!bridgeFees || feesLoading) return "Loading...";

    const sourceUpper = sourceChain.toUpperCase();
    const targetUpper = targetChain.toUpperCase();

    if (bridgeProvider === "axelar") {
      const axelarFees = bridgeFees.AXELAR;
      if (sourceUpper === "CELO" && targetUpper === "ETH") {
        return axelarFees.AXL_CELO_TO_ETH;
      }
      if (sourceUpper === "ETH" && targetUpper === "CELO") {
        return axelarFees.AXL_ETH_TO_CELO;
      }
    } else if (bridgeProvider === "layerzero") {
      const layerzeroFees = bridgeFees.LAYERZERO;
      if (sourceUpper === "ETH" && targetUpper === "CELO") {
        return layerzeroFees.LZ_ETH_TO_CELO;
      }
      if (sourceUpper === "ETH" && targetUpper === "FUSE") {
        return layerzeroFees.LZ_ETH_TO_FUSE;
      }
      if (sourceUpper === "CELO" && targetUpper === "ETH") {
        return layerzeroFees.LZ_CELO_TO_ETH;
      }
      if (sourceUpper === "CELO" && targetUpper === "FUSE") {
        return layerzeroFees.LZ_CELO_TO_FUSE;
      }
      if (sourceUpper === "FUSE" && targetUpper === "ETH") {
        return layerzeroFees.LZ_FUSE_TO_ETH;
      }
      if (sourceUpper === "FUSE" && targetUpper === "CELO") {
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
          Bridge G$ tokens between Fuse, Celo, and Ethereum Mainnet using LayerZero or Axelar for secure cross-chain
          transfers.
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
            {/* Source Chain */}
            <VStack space={3}>
              <Text fontFamily="subheading" fontSize="md" color="goodGrey.600" fontWeight="600">
                From
              </Text>
              <HStack space={4} alignItems="center">
                <Box
                  bg={getChainColor(sourceChain)}
                  borderRadius="full"
                  width="10"
                  height="10"
                  alignItems="center"
                  justifyContent="center"
                  shadow="sm"
                >
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {getChainIcon(sourceChain)}
                  </Text>
                </Box>
                <Select
                  selectedValue={sourceChain}
                  onValueChange={setSourceChain}
                  flex={1}
                  borderRadius="lg"
                  borderColor="goodGrey.300"
                  fontSize="md"
                  padding={4}
                >
                  <Select.Item label="G$ Fuse" value="fuse" />
                  <Select.Item label="G$ Celo" value="celo" />
                  <Select.Item label="G$ Ethereum" value="mainnet" />
                </Select>
              </HStack>
            </VStack>

            {/* Swap Arrow */}
            <Box alignItems="center">
              <Box
                bg="goodGrey.200"
                borderRadius="full"
                width="12"
                height="12"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
              >
                <Text fontSize="xl" color="goodGrey.600" fontWeight="bold">
                  ⇄
                </Text>
              </Box>
            </Box>

            {/* Target Chain */}
            <VStack space={3}>
              <Text fontFamily="subheading" fontSize="md" color="goodGrey.600" fontWeight="600">
                To
              </Text>
              <HStack space={4} alignItems="center">
                <Box
                  bg={getChainColor(targetChain)}
                  borderRadius="full"
                  width="10"
                  height="10"
                  alignItems="center"
                  justifyContent="center"
                  shadow="sm"
                >
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {getChainIcon(targetChain)}
                  </Text>
                </Box>
                <Box
                  bg="goodGrey.100"
                  borderRadius="lg"
                  padding={4}
                  flex={1}
                  borderWidth="1"
                  borderColor="goodGrey.300"
                >
                  <Text color="goodGrey.700" fontSize="md" fontWeight="600">
                    G$ {targetChain.charAt(0).toUpperCase() + targetChain.slice(1)}
                  </Text>
                </Box>
              </HStack>
            </VStack>

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
                  Minimum amount is 1 G$
                </Text>
              )}
            </VStack>

            {/* Expected Output */}
            <VStack space={3}>
              <Text fontFamily="subheading" fontSize="md" color="goodGrey.600" fontWeight="600">
                You will receive on {targetChain.toUpperCase()}
              </Text>
              <Input
                value={expectedToReceive ? expectedToReceive.toString() : "0"}
                isReadOnly
                borderRadius="lg"
                borderColor="goodGrey.300"
                bg="goodGrey.50"
                fontSize="md"
                padding={4}
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
                Minimum amount to bridge: 1 G$
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
