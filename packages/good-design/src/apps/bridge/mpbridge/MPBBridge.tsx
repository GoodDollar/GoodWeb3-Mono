import React, { useEffect, useCallback, useState } from "react";
import { Box, HStack, Pressable, Spinner, Text, VStack } from "native-base";
import { CurrencyValue } from "@usedapp/core";
import { SupportedChains, useG$Amounts, useG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";

import { Web3ActionButton } from "../../../advanced";
import { TokenInput } from "../../../core";
import { BigNumber } from "ethers";

import type { IMPBFees, IMPBLimits, MPBBridgeProps, BridgeProvider } from "./types";
import { useWizard } from "react-use-wizard";
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
  const { nextStep } = useWizard();
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
      void nextStep();
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

  const getActiveColor = useCallback(
    (chain: string) => {
      return sourceChain === chain ? "goodBlue.500" : "goodGrey.400";
    },
    [sourceChain]
  );

  const getActiveTextColor = useCallback(
    (chain: string) => {
      return sourceChain === chain ? "goodBlue.500" : "goodGrey.600";
    },
    [sourceChain]
  );

  return (
    <VStack space={4} width="100%" alignSelf="center">
      {/* Bridge Provider Selection */}
      <Box borderRadius="md" borderWidth="1" padding="5" backgroundColor="goodWhite.100">
        <VStack space={4}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontFamily="heading" fontSize="md" fontWeight="700">
              Bridge Provider
            </Text>
          </HStack>
          <HStack space={2}>
            <Pressable
              flex={1}
              onPress={() => setBridgeProvider("axelar")}
              bg={bridgeProvider === "axelar" ? "goodBlue.500" : "goodGrey.100"}
              borderRadius="md"
              padding={3}
              alignItems="center"
            >
              <Text color={bridgeProvider === "axelar" ? "white" : "goodGrey.700"} fontWeight="600" fontSize="sm">
                Axelar
              </Text>
            </Pressable>
            <Pressable
              flex={1}
              onPress={() => setBridgeProvider("layerzero")}
              bg={bridgeProvider === "layerzero" ? "goodBlue.500" : "goodGrey.100"}
              borderRadius="md"
              padding={3}
              alignItems="center"
            >
              <Text color={bridgeProvider === "layerzero" ? "white" : "goodGrey.700"} fontWeight="600" fontSize="sm">
                LayerZero
              </Text>
            </Pressable>
          </HStack>

          {/* Bridge Fee Display */}
          <VStack space={1}>
            <Text fontFamily="subheading" fontSize="xs" color="goodGrey.600">
              Bridge Fee:
            </Text>
            <Text fontFamily="subheading" fontSize="sm" color="goodBlue.600" fontWeight="600">
              {getCurrentBridgeFee()}
            </Text>
          </VStack>
        </VStack>
      </Box>

      {/* Bridging Status Banner */}
      {isBridging && (
        <Box borderRadius="md" padding={3} backgroundColor="goodBlue.100" borderWidth="1" borderColor="goodBlue.300">
          <HStack space={2} alignItems="center">
            <Spinner size="sm" color="goodBlue.500" />
            <Text color="goodBlue.700" fontSize="sm" fontWeight="500">
              {bridgingStatus}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Token Input/Output */}
      <Box borderRadius="md" borderWidth="1" padding="5" backgroundColor="goodWhite.100">
        <VStack space={4}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontFamily="heading" fontSize="md" fontWeight="700">
              Bridge G$ Tokens
            </Text>
          </HStack>

          {/* Source Chain */}
          <VStack space={2}>
            <Text fontFamily="subheading" fontSize="xs" color="goodGrey.600">
              From
            </Text>
            <HStack space={2}>
              <Pressable
                onPress={() => setSourceChain("fuse")}
                bg={getActiveColor("fuse")}
                borderRadius="md"
                padding={2}
                flex={1}
                alignItems="center"
              >
                <Text color={getActiveTextColor("fuse")} fontSize="xs" fontWeight="600">
                  Fuse
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSourceChain("celo")}
                bg={getActiveColor("celo")}
                borderRadius="md"
                padding={2}
                flex={1}
                alignItems="center"
              >
                <Text color={getActiveTextColor("celo")} fontSize="xs" fontWeight="600">
                  Celo
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSourceChain("mainnet")}
                bg={getActiveColor("mainnet")}
                borderRadius="md"
                padding={2}
                flex={1}
                alignItems="center"
              >
                <Text color={getActiveTextColor("mainnet")} fontSize="xs" fontWeight="600">
                  Mainnet
                </Text>
              </Pressable>
            </HStack>
          </VStack>

          {/* Amount Input */}
          <VStack space={2}>
            <Text fontFamily="subheading" fontSize="xs" color="goodGrey.600">
              Amount (G$)
            </Text>
            <TokenInput
              balanceWei={wei}
              onChange={setBridgeAmount}
              gdValue={gdValue}
              minAmountWei={minimumAmount?.toString()}
            />
          </VStack>

          {/* Target Chain */}
          <VStack space={2}>
            <Text fontFamily="subheading" fontSize="xs" color="goodGrey.600">
              To
            </Text>
            <Box bg="goodGrey.100" borderRadius="md" padding={3} alignItems="center">
              <Text color="goodGrey.700" fontSize="sm" fontWeight="600">
                {targetChain.charAt(0).toUpperCase() + targetChain.slice(1)}
              </Text>
            </Box>
          </VStack>

          {/* Bridge Button */}
          <Web3ActionButton
            web3Action={triggerBridge}
            disabled={!isValidInput || isBridging}
            isLoading={isBridging}
            text={isBridging ? "Bridging..." : `Bridge via ${bridgeProvider === "axelar" ? "Axelar" : "LayerZero"}`}
            supportedChains={[SupportedChains[sourceChain.toUpperCase() as keyof typeof SupportedChains]]}
            variant="primary"
            size="lg"
          />
        </VStack>
      </Box>
    </VStack>
  );
};
