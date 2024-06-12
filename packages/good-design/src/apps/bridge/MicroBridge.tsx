import React, { useEffect, useCallback, useState } from "react";
import { Box, FormControl, HStack, Pressable, Spinner, Text, VStack, WarningOutlineIcon } from "native-base";
import { CurrencyValue } from "@usedapp/core";
import { SupportedChains, useG$Amount } from "@gooddollar/web3sdk-v2";
import { isEmpty } from "lodash";

import { Web3ActionButton } from "../../advanced";
import { Image, TokenInput, TokenOutput } from "../../core";
import { BigNumber } from "ethers";
import { GdAmount } from "../../core/layout/BalanceGD";
import { useBalanceHook } from "./useBalanceHook";
import { capitalizeFirstLetter } from "../../utils";

import ArrowTabLightRight from "../../assets/svg/arrow-tab-light-right.svg";

import type { IFees, ILimits, MicroBridgeProps } from "./types";
import { useWizard } from "react-use-wizard";

const useBridgeEstimate = ({
  limits,
  fees,
  sourceChain,
  inputWei
}: {
  limits?: ILimits;
  fees?: IFees;
  sourceChain: string;
  inputWei: string;
}): {
  expectedFee: CurrencyValue;
  expectedToReceive: CurrencyValue;
  minimumAmount: CurrencyValue;
  maximumAmount: CurrencyValue;
  bridgeFee: CurrencyValue;
  minFee: CurrencyValue;
  maxFee: CurrencyValue;
  minAmountWei: CurrencyValue;
} => {
  const chain = sourceChain === "celo" ? 42220 : 122;
  const minimumAmount = useG$Amount(limits?.[sourceChain]?.minAmount, "G$", chain);
  const maximumAmount = useG$Amount(limits?.[sourceChain]?.txLimit, "G$", chain);
  const bridgeFee = useG$Amount(fees?.[sourceChain]?.fee, "G$", chain);
  const minFee = useG$Amount(fees?.[sourceChain]?.minFee, "G$", chain);
  const maxFee = useG$Amount(fees?.[sourceChain]?.maxFee, "G$", chain);
  const input = useG$Amount(BigNumber.from(inputWei), "G$", chain);
  const minAmountWei = useG$Amount(limits?.[sourceChain]?.minAmount);

  //bridge fee is in BPS so divide by 10000
  const expectedFee = bridgeFee.mul(input.value).div(10000);

  const expectedToReceive = input.sub(expectedFee.gt(minFee) ? expectedFee : minFee);

  return { expectedFee, expectedToReceive, minimumAmount, maximumAmount, bridgeFee, minFee, maxFee, minAmountWei };
};

export const MicroBridge = ({
  useCanBridge,
  onSetChain,
  originChain,
  inputTransaction,
  pendingTransaction,
  limits,
  fees,
  bridgeStatus,
  relayStatus,
  selfRelayStatus,
  onBridgeStart,
  onBridgeFailed,
  onBridgeSuccess
}: MicroBridgeProps) => {
  const [isBridging, setBridging] = useState(false);
  const { nextStep } = useWizard();
  const [sourceChain, setSourceChain] = originChain;
  const targetChain = sourceChain === "fuse" ? "celo" : "fuse";
  const [toggleState, setToggleState] = useState<boolean>(false);

  const balances = useBalanceHook() ?? {};
  const { wei, gdValue } = balances[sourceChain] ?? {};
  const [bridgeWeiAmount, setBridgeAmount] = inputTransaction;
  const [, setPendingTransaction] = pendingTransaction;
  const { isValid, reason } = useCanBridge(sourceChain, bridgeWeiAmount);
  const { minAmountWei, expectedToReceive } = useBridgeEstimate({
    limits,
    fees,
    inputWei: bridgeWeiAmount,
    sourceChain
  });

  const hasBalance = Number(bridgeWeiAmount) <= Number(wei);
  const isValidInput = isValid && hasBalance;
  const reasonOf = reason || (!hasBalance && "balance") || "";

  const toggleChains = useCallback(() => {
    setSourceChain(targetChain);
    setToggleState(prevState => !prevState);
    onSetChain?.(targetChain);
  }, [setSourceChain, onSetChain, targetChain]);

  const triggerBridge = useCallback(async () => {
    setPendingTransaction({ bridgeWeiAmount, expectedToReceive });
    onBridgeStart?.();
    void nextStep();
  }, [setBridging, onBridgeStart, bridgeWeiAmount, sourceChain, expectedToReceive]);

  useEffect(() => {
    const { status = "", errorMessage, errorCode } = relayStatus ?? {};
    const { status: selfStatus = "" } = selfRelayStatus ?? {};
    // if self relay succeeded then we are done, other wise we need to wait for relayStatus
    const isSuccess = [status, selfStatus].includes("Success");
    // if bridge relayer failed or succeeded then we are done
    const isFailed = ["Fail", "Exception"].includes(status);
    // when bridge is signing, mining or succeed but relay not done yet - we're still bridging
    const isBridging =
      !isFailed && !isSuccess && ["Mining", "PendingSignature", "Success"].includes(bridgeStatus?.status ?? "");

    setBridging(isBridging);

    if (isSuccess) {
      onBridgeSuccess?.();
    }

    if (isFailed) {
      const exception = new Error(errorMessage ?? "Failed to bridge");

      if (errorCode) {
        exception.name = `BridgeError #${errorCode}`;
      }

      onBridgeFailed?.(exception);
    }
  }, [relayStatus, bridgeStatus, selfRelayStatus, onBridgeSuccess, onBridgeFailed]);

  const reasonMinAmount =
    reason === "minAmount"
      ? " Minimum amount is " + Number(minAmountWei) / (sourceChain === "fuse" ? 1e2 : 1e18) + "G$"
      : undefined;

  if (isEmpty(balances)) return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack padding={4} width="100%" w="410px" alignSelf="center" backgroundColor="goodWhite.100">
      <VStack marginBottom={10}>
        <HStack zIndex="100" justifyContent="space-between">
          <VStack>
            <Text color="goodGrey.700" fontSize="l" fontFamily="heading" fontWeight="700">
              G$ Celo
            </Text>
            <GdAmount amount={balances.celo.gdValue} withDefaultSuffix={false} withFullBalance fontSize="xs" />
          </VStack>

          <Box w="100px" height="64px" pl="3" pr="3" display="flex" justifyContent={"center"} alignItems="center">
            <Pressable onPress={toggleChains} backgroundColor="primary" borderRadius="50" p="2">
              <Image source={ArrowTabLightRight} w="6" h="6" />
            </Pressable>
          </Box>
          <VStack>
            <Text color="goodGrey.700" fontSize="l" fontFamily="heading" fontWeight="700">
              G$ Fuse
            </Text>
            <GdAmount amount={balances.fuse.gdValue} withDefaultSuffix={false} withFullBalance fontSize="xs" />
          </VStack>
        </HStack>
      </VStack>
      <VStack alignItems="flex-start" justifyContent="flex-start" width="100%">
        <TokenInput
          balanceWei={wei}
          gdValue={gdValue}
          onChange={setBridgeAmount}
          minAmountWei={minAmountWei?.toString()}
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
      <Web3ActionButton
        mt="5"
        text={`Bridge to ${capitalizeFirstLetter(targetChain)}`}
        supportedChains={[SupportedChains[sourceChain.toUpperCase() as keyof typeof SupportedChains]]}
        web3Action={triggerBridge}
        disabled={isBridging}
        backgroundColor="primary"
        borderRadius={24}
        isDisabled={isBridging || isValidInput === false}
        innerText={{
          fontSize: "sm",
          color: "white",
          fontFamily: "subheading"
        }}
        innerIndicatorText={{
          fontSize: "sm",
          color: "white",
          fontFamily: "subheading"
        }}
      />
      <VStack space={1} mt={4} textAlign="left" width="100%">
        <Text fontFamily="subheading" fontSize="xs" color="goodGrey.400">
          Minimum amount to bridge: 1,000 G$
        </Text>
        <Text fontFamily="subheading" fontSize="xs" color="goodGrey.400">
          Bridge Fee: <b>G$ 10 or 0.15%</b> of transaction <i>(See FAQs for more on Fees)</i>
        </Text>
      </VStack>
    </VStack>
  );
};
