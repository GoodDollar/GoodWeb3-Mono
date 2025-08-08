import React, { useEffect, useCallback, useState } from "react";
import { Box, FormControl, HStack, Pressable, Spinner, Text, VStack, WarningOutlineIcon, Button } from "native-base";
import { CurrencyValue } from "@usedapp/core";
import { SupportedChains, useG$Amounts, useG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { isEmpty } from "lodash";

import { Web3ActionButton } from "../../../advanced";
import { Image, TokenInput, TokenOutput } from "../../../core";
import { BigNumber } from "ethers";
import { GdAmount } from "../../../core/layout/BalanceGD";

import ArrowTabLightRight from "../../../assets/svg/arrow-tab-light-right.svg";

import type { IMPBFees, IMPBLimits, MPBBridgeProps, BridgeProvider } from "./types";
import { useWizard } from "react-use-wizard";

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
  onSetChain,
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
  const [toggleState, setToggleState] = useState<boolean>(false);

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

  const hasBalance = Number(bridgeWeiAmount) <= Number(wei);
  const isValidInput = isValid && hasBalance;
  const reasonOf = reason || (!hasBalance && "Not enough balance") || "";

  const toggleChains = useCallback(() => {
    setSourceChain(targetChain);
    setToggleState(prevState => !prevState);
    onSetChain?.(targetChain);
  }, [setSourceChain, onSetChain, targetChain]);

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

  const reasonMinAmount =
    reason === "minAmount"
      ? ` Minimum amount is ${Number(minimumAmount) / (sourceChain === "fuse" ? 1e2 : 1e18)} G$`
      : undefined;

  const getActiveColor = useCallback(
    (chain: string) => {
      return sourceChain === chain ? "goodGrey.700" : "goodGrey.400";
    },
    [sourceChain]
  );

  if (isEmpty(fuseBalance) || isEmpty(celoBalance) || isEmpty(mainnetBalance)) {
    return <Spinner variant="page-loader" size="lg" />;
  }

  const fuseActiveColor = getActiveColor("fuse");
  const celoActiveColor = getActiveColor("celo");
  const mainnetActiveColor = getActiveColor("mainnet");

  return (
    <VStack padding={4} width="100%" alignSelf="center" backgroundColor="goodWhite.100">
      {/* Bridge Provider Selection */}
      <VStack space={4} mb={6}>
        <Text fontFamily="heading" fontSize="md" fontWeight="700" textAlign="center">
          Select Bridge Provider
        </Text>
        <HStack space={3} justifyContent="center">
          <Button
            variant={bridgeProvider === "axelar" ? "solid" : "outline"}
            bg={bridgeProvider === "axelar" ? "blue.500" : "transparent"}
            borderColor="blue.500"
            borderRadius="full"
            onPress={() => setBridgeProvider("axelar")}
            _pressed={{ bg: bridgeProvider === "axelar" ? "blue.600" : "gray.100" }}
          >
            <Text color={bridgeProvider === "axelar" ? "white" : "blue.500"} fontWeight="semibold">
              Axelar
            </Text>
          </Button>
          <Button
            variant={bridgeProvider === "layerzero" ? "solid" : "outline"}
            bg={bridgeProvider === "layerzero" ? "blue.500" : "transparent"}
            borderColor="blue.500"
            borderRadius="full"
            onPress={() => setBridgeProvider("layerzero")}
            _pressed={{ bg: bridgeProvider === "layerzero" ? "blue.600" : "gray.100" }}
          >
            <Text color={bridgeProvider === "layerzero" ? "white" : "blue.500"} fontWeight="semibold">
              LayerZero
            </Text>
          </Button>
        </HStack>
      </VStack>

      {/* Bridging Status Display */}
      {isBridging && (
        <Box bg="blue.50" borderWidth="1" borderColor="blue.200" borderRadius="md" p="3" mb="4">
          <HStack space={2} alignItems="center">
            <Spinner size="sm" color="blue.500" />
            <Text color="blue.700" fontWeight="medium">
              {bridgingStatus}
            </Text>
          </HStack>
        </Box>
      )}

      <VStack marginBottom={10}>
        <HStack zIndex="100" justifyContent="space-between" flexWrap="wrap">
          <VStack flex="1" minW="120px">
            <Text color={fuseActiveColor} fontSize="l" fontFamily="heading" fontWeight="700">
              G$ Fuse
            </Text>
            <GdAmount
              color={fuseActiveColor}
              amount={fuseBalance}
              withDefaultSuffix={false}
              withFullBalance
              fontSize="xs"
            />
          </VStack>

          <Box w="60px" height="64px" pl="2" pr="2" display="flex" justifyContent={"center"} alignItems="center">
            <Pressable onPress={toggleChains} backgroundColor="gdPrimary" borderRadius="50" p="2">
              <Image
                source={ArrowTabLightRight}
                w="4"
                h="4"
                style={{ transform: [{ rotate: sourceChain === "fuse" ? "180deg" : "0" }] }}
              />
            </Pressable>
          </Box>

          <VStack flex="1" minW="120px">
            <Text color={celoActiveColor} fontSize="l" fontFamily="heading" fontWeight="700">
              G$ Celo
            </Text>
            <GdAmount
              color={celoActiveColor}
              amount={celoBalance}
              withDefaultSuffix={false}
              withFullBalance
              fontSize="xs"
            />
          </VStack>

          <Box w="60px" height="64px" pl="2" pr="2" display="flex" justifyContent={"center"} alignItems="center">
            <Pressable onPress={toggleChains} backgroundColor="gdPrimary" borderRadius="50" p="2">
              <Image
                source={ArrowTabLightRight}
                w="4"
                h="4"
                style={{ transform: [{ rotate: sourceChain === "celo" ? "180deg" : "0" }] }}
              />
            </Pressable>
          </Box>

          <VStack flex="1" minW="120px">
            <Text color={mainnetActiveColor} fontSize="l" fontFamily="heading" fontWeight="700">
              G$ Mainnet
            </Text>
            <GdAmount
              color={mainnetActiveColor}
              amount={mainnetBalance}
              withDefaultSuffix={false}
              withFullBalance
              fontSize="xs"
            />
          </VStack>
        </HStack>
      </VStack>

      <VStack alignItems="flex-start" justifyContent="flex-start" width="100%">
        <TokenInput
          balanceWei={wei}
          gdValue={gdValue}
          onChange={setBridgeAmount}
          minAmountWei={minimumAmount?.toString()}
          toggleState={toggleState}
        />
      </VStack>

      <FormControl isInvalid={!!reasonOf}>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon variant="outline" />}>
          {reasonMinAmount ?? reasonOf}
        </FormControl.ErrorMessage>
      </FormControl>

      <VStack mt="4" direction="column" alignItems="flex-start" justifyContent="flex-start" width="100%">
        <Text fontFamily="subheading" color="lightGrey:alpha.80" textTransform="uppercase" bold>
          You will receive on {targetChain}
        </Text>
        <TokenOutput outputValue={expectedToReceive ?? "0"} />
      </VStack>

      <VStack mt="4" space={2}>
        <Text fontFamily="subheading" fontSize="xs" color="goodGrey.400">
          Bridge Fee: {nativeFee ? `${nativeFee.value.toString()} ETH` : "Calculating..."}
        </Text>
        <Text fontFamily="subheading" fontSize="xs" color="goodGrey.400">
          Powered by {bridgeProvider === "axelar" ? "Axelar" : "LayerZero"}
        </Text>
      </VStack>

      <Web3ActionButton
        mt="5"
        text={isBridging ? "Bridging..." : `Bridge to ${targetChain} via ${bridgeProvider}`}
        supportedChains={[SupportedChains[sourceChain.toUpperCase() as keyof typeof SupportedChains]]}
        web3Action={triggerBridge}
        disabled={isBridging}
        backgroundColor="gdPrimary"
        borderRadius={24}
        isDisabled={isBridging || isValidInput === false}
        innerText={{
          fontSize: "sm",
          color: "white",
          fontFamily: "subheading",
          textTransform: "capitalize"
        }}
        innerIndicatorText={{
          fontSize: "sm",
          color: "white",
          fontFamily: "subheading"
        }}
      />

      <VStack space={1} mt={4} textAlign="left" width="100%">
        <Text fontFamily="subheading" fontSize="xs" color="goodGrey.400">
          Minimum amount to bridge: 1 G$
        </Text>
        <Text fontFamily="subheading" fontSize="xs" color="goodGrey.400">
          Bridge Fee: <b>Variable fee in native token</b> <i>(See FAQs for more on Fees)</i>
        </Text>
      </VStack>
    </VStack>
  );
};
