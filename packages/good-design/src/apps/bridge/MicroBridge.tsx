import React, { useEffect, useCallback, useState } from "react";
import {
  Box,
  Button,
  CheckIcon,
  CloseIcon,
  Flex,
  FormControl,
  HStack,
  IconButton,
  InfoOutlineIcon,
  Popover,
  Pressable,
  Spinner,
  Stack,
  Text,
  VStack,
  WarningOutlineIcon
} from "native-base";
import { CurrencyValue, TransactionStatus, useEthers } from "@usedapp/core";
import { useG$Amount } from "@gooddollar/web3sdk-v2";
import { isEmpty } from "lodash";

import { Image, TokenInput, TokenOutput } from "../../core";
import { BigNumber } from "ethers";
import { ExplorerLink } from "../../core/web3/ExplorerLink";
import { GdAmount } from "../../core/layout/BalanceGD";
import { useBalanceHook } from "./useBalanceHook";

import ArrowTabLightRight from "../../assets/svg/arrow-tab-light-right.svg";

type OnBridge = (amount: string, sourceChain: string, target?: string) => Promise<void>;

type ILimits = Record<
  string,
  { dailyLimit: BigNumber; txLimit: BigNumber; accountDailyLimit: BigNumber; minAmount: BigNumber }
>;

type IFees = Record<string, { minFee: BigNumber; maxFee: BigNumber; fee: BigNumber }>;

const Status = ({ result, ...props }: { result?: string }) => {
  switch (result) {
    case undefined:
    case "Mining":
    case "PendingSignature":
    default:
      return <Spinner {...props} />;
    case "Success":
      return <CheckIcon size="5" mt="0.5" color="emerald.500" {...props} />;
    case "Fail":
    case "Exception":
      return <CloseIcon size="5" mt="0.5" color="danger.500" {...props} />;
  }
};

const TriggerButton = (props: any) => <IconButton {...props} icon={<InfoOutlineIcon />} />;

const StatusBox = ({
  txStatus,
  text,
  infoText
}: {
  txStatus?: Partial<TransactionStatus>;
  text: string;
  infoText?: string;
  sourceChain: "fuse" | "celo";
}) => (
  <Stack mt="2" alignItems="center" direction={["column", "column", "row"]}>
    <HStack alignItems="center" flex="2 0">
      <Box>
        <Status result={txStatus?.status} />
      </Box>
      <Box flex={"1 1"}>
        <Text color="emerald.500" fontSize="md" ml="2">
          {text}
        </Text>
      </Box>
      {infoText && (
        <Popover trigger={TriggerButton}>
          <Popover.Content accessibilityLabel={infoText} w="md">
            <Popover.CloseButton />
            <Popover.Body>{infoText}</Popover.Body>
          </Popover.Content>
        </Popover>
      )}
    </HStack>
    <Flex flex="1 1" alignItems="center" maxWidth="100%">
      {txStatus && <ExplorerLink chainId={txStatus.chainId} addressOrTx={txStatus.transaction?.hash} />}
    </Flex>
  </Stack>
);

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
  const minimumAmount = useG$Amount(limits?.[sourceChain]?.minAmount, "G$", Number(sourceChain));
  const maximumAmount = useG$Amount(limits?.[sourceChain]?.txLimit, "G$", Number(sourceChain));
  const bridgeFee = useG$Amount(fees?.[sourceChain]?.fee, "G$", Number(sourceChain));
  const minFee = useG$Amount(fees?.[sourceChain]?.minFee, "G$", Number(sourceChain));
  const maxFee = useG$Amount(fees?.[sourceChain]?.maxFee, "G$", Number(sourceChain));
  const input = useG$Amount(BigNumber.from(inputWei), "G$", Number(sourceChain));

  //bridge fee is in BPS so divide by 10000
  const expectedFee = bridgeFee.mul(input.value).div(10000);

  const expectedToReceive = input.sub(expectedFee);

  const minAmountWei = useG$Amount(limits?.[sourceChain]?.minAmount);

  return { expectedFee, expectedToReceive, minimumAmount, maximumAmount, bridgeFee, minFee, maxFee, minAmountWei };
};

export const MicroBridge = ({
  useCanBridge,
  onBridge,
  onSetChain,
  limits,
  fees,
  bridgeStatus,
  relayStatus,
  selfRelayStatus,
  onBridgeStart,
  onBridgeFailed,
  onBridgeSuccess
}: {
  onBridge: OnBridge;
  useCanBridge: (chain: "fuse" | "celo", amountWei: string) => { isValid: boolean; reason: string };
  onSetChain?: (chain: "fuse" | "celo") => void;
  limits?: ILimits;
  fees?: IFees;
  bridgeStatus?: Partial<TransactionStatus>;
  relayStatus?: Partial<TransactionStatus>;
  selfRelayStatus?: Partial<TransactionStatus>;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}) => {
  const { chainId } = useEthers();
  const [isBridging, setBridging] = useState(false);
  const [inputWei, setInput] = useState<string>("0");

  const [sourceChain, setSourceChain] = useState<"fuse" | "celo">(chainId === 122 ? "fuse" : "celo");

  const targetChain = sourceChain === "fuse" ? "celo" : "fuse";
  const balances = useBalanceHook() ?? {};
  const { wei, gdValue } = balances[sourceChain] ?? {};

  const { isValid, reason } = useCanBridge(sourceChain, inputWei);
  const hasBalance = Number(inputWei) <= Number(wei);
  const isValidInput = isValid && hasBalance;
  const reasonOf = reason || (!hasBalance && "balance") || "";

  const toggleChains = useCallback(() => {
    setSourceChain(targetChain);
    onSetChain?.(targetChain);
  }, [setSourceChain, onSetChain, targetChain]);

  const triggerBridge = useCallback(async () => {
    setBridging(true);
    onBridgeStart?.();

    try {
      await onBridge(inputWei, sourceChain);
    } finally {
      setBridging(false);
    }
  }, [setBridging, onBridgeStart, onBridge, inputWei, sourceChain]);

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

  const { minAmountWei, expectedToReceive } = useBridgeEstimate({ limits, fees, inputWei, sourceChain });
  const reasonMinAmount =
    reason === "minAmount"
      ? " Minimum amount is " + Number(minAmountWei) / (sourceChain === "fuse" ? 1e2 : 1e18) + "G$"
      : undefined;

  if (isEmpty(balances)) return <Spinner variant="page-loader" />;

  return (
    <Box>
      <Flex direction="column" w="410px" justifyContent="center" alignSelf="center">
        <VStack marginBottom={10}>
          {/* wip: make separate component after testing */}
          <HStack zIndex="100" justifyContent="space-between">
            <VStack>
              <Text color="goodGrey.700" fontSize="l" fontFamily="heading" fontWeight="700">
                G$ Celo
              </Text>
              <GdAmount amount={balances.celo.gdValue} withDefaultSuffix={false} fontSize="sm" />
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
              <GdAmount amount={balances.fuse.gdValue} withDefaultSuffix={false} fontSize="sm" />
            </VStack>
          </HStack>
        </VStack>
        <VStack alignItems="flex-start" justifyContent="flex-start" width="100%">
          <TokenInput balanceWei={wei} gdValue={gdValue} onChange={setInput} minAmountWei={minAmountWei?.toString()} />
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
          <TokenOutput token="G$" outputValue={expectedToReceive.value.toString() ?? "0"} />
        </VStack>
        <Button
          mt="5"
          onPress={triggerBridge}
          backgroundColor="main"
          isLoading={isBridging}
          disabled={isBridging || isValidInput === false}
        >
          <Text fontFamily="subheading" bold color="white" textTransform="uppercase">
            {`Bridge to ${targetChain}`}
          </Text>
        </Button>
        {(isBridging || (bridgeStatus && bridgeStatus?.status != "None")) && (
          <Box borderWidth="1" mt="10" padding="5" rounded="lg">
            <StatusBox text="Sending funds to bridge" txStatus={bridgeStatus} sourceChain={sourceChain} />

            {bridgeStatus?.status === "Success" && selfRelayStatus && (
              <StatusBox
                text="Self relaying to target chain... (Can take a few minutes)"
                infoText="If you have enough native tokens on the target chain, you will execute the transfer on the target chain yourself and save some bridge fees"
                txStatus={selfRelayStatus}
                sourceChain={sourceChain}
              />
            )}
            {bridgeStatus?.status === "Success" && (
              <StatusBox
                text="Waiting for bridge relayers to relay to target chain... (Can take a few minutes)"
                infoText="If you don't have enough native tokens on the target chain, a bridge relay service will execute the transfer for a small G$ fee"
                txStatus={relayStatus}
                sourceChain={sourceChain}
              />
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
};
