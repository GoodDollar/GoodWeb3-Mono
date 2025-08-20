import React, { useEffect, useCallback, useState } from "react";
import { Box, FormControl, HStack, Pressable, Spinner, Text, VStack, WarningOutlineIcon } from "native-base";
import { CurrencyValue } from "@usedapp/core";
import { SupportedChains, useG$Amounts, useG$Balance } from "@gooddollar/web3sdk-v2";
import { isEmpty } from "lodash";

import { Web3ActionButton } from "../../advanced";
import { Image, TokenInput, TokenOutput } from "../../core";
import { BigNumber } from "ethers";
import { GdAmount } from "../../core/layout/BalanceGD";

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
  // minAmountWei: CurrencyValue;
} => {
  const chain = sourceChain === "celo" ? 42220 : 122;

  const { minimumAmount, maximumAmount, bridgeFee, minFee, maxFee, input } = useG$Amounts(
    {
      minimumAmount: limits?.[sourceChain]?.minAmount,
      maximumAmount: limits?.[sourceChain]?.txLimit,
      bridgeFee: fees?.[sourceChain]?.fee,
      minFee: fees?.[sourceChain]?.minFee,
      maxFee: fees?.[sourceChain]?.maxFee,
      input: BigNumber.from(inputWei)
    },
    "G$",
    chain
  );

  //bridge fee is in BPS so divide by 10000
  const expectedFee = bridgeFee.mul(input.value).div(10000);

  // For G$ bridging, user should receive the same amount they send
  // The fee is paid separately, not deducted from the G$ amount
  const expectedToReceive = input;

  return { expectedFee, expectedToReceive, minimumAmount, maximumAmount, bridgeFee, minFee, maxFee };
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

  // query balances every 5 blocks, so balance is updated after bridging
  const { G$: fuseBalance } = useG$Balance(5, 122);
  const { G$: celoBalance } = useG$Balance(5, 42220);

  const gdValue = sourceChain === "fuse" ? fuseBalance : celoBalance;
  const wei = gdValue.value.toString();
  const [bridgeWeiAmount, setBridgeAmount] = inputTransaction;
  const [, setPendingTransaction] = pendingTransaction;
  const { isValid, reason } = useCanBridge(sourceChain, bridgeWeiAmount);
  const { minimumAmount, expectedToReceive } = useBridgeEstimate({
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
    setPendingTransaction({ bridgeWeiAmount, expectedToReceive });
    onBridgeStart?.();
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

    // show next step only once user signs tx
    if (bridgeStatus?.status === "Mining") {
      void nextStep();
    }
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
      ? " Minimum amount is " + Number(minimumAmount) / (sourceChain === "fuse" ? 1e2 : 1e18) + "G$"
      : undefined;

  const getActiveColor = useCallback(
    (chain: string) => {
      return sourceChain === chain ? "goodGrey.700" : "goodGrey.400";
    },
    [sourceChain]
  );

  if (isEmpty(fuseBalance) || isEmpty(celoBalance)) return <Spinner variant="page-loader" size="lg" />;

  const celoActiveColor = getActiveColor("celo");
  const fuseActiveColor = getActiveColor("fuse");

  return (
    <VStack padding={4} width="100%" alignSelf="center" backgroundColor="goodWhite.100">
      <VStack marginBottom={10}>
        <HStack zIndex="100" justifyContent="space-between">
          <VStack>
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

          <Box w="100px" height="64px" pl="3" pr="3" display="flex" justifyContent={"center"} alignItems="center">
            <Pressable onPress={toggleChains} backgroundColor="gdPrimary" borderRadius="50" p="2">
              <Image
                source={ArrowTabLightRight}
                w="6"
                h="6"
                style={{ transform: [{ rotate: sourceChain === "fuse" ? "180deg" : "0" }] }}
              />
            </Pressable>
          </Box>
          <VStack>
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
      <Web3ActionButton
        mt="5"
        text={`Bridge to ${targetChain}`}
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
          Minimum amount to bridge: 1,000 G$
        </Text>
        <Text fontFamily="subheading" fontSize="xs" color="goodGrey.400">
          Bridge Fee: <b>G$ 10 or 0.15%</b> of transaction <i>(See FAQs for more on Fees)</i>
        </Text>
      </VStack>
    </VStack>
  );
};
