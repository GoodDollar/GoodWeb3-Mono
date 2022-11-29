import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckIcon,
  CloseIcon,
  Flex,
  FormControl,
  HStack,
  IconButton,
  InfoOutlineIcon,
  Popover,
  Spinner,
  Stack,
  Switch,
  Text,
  WarningOutlineIcon
} from "native-base";
import { TransactionStatus } from "@usedapp/core";
import { TokenInput } from "../../core";
import { AddressInput, isAddressValid } from "../../core/inputs/AddressInput";
import { BigNumber } from "ethers";
import { ExplorerLink } from "../../core/web3/ExplorerLink";

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
  infoText,
  sourceChain
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
  expectedFee?: string;
  expectedToReceive?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  bridgeFee?: number;
  minFee?: number;
  maxFee?: number;
  minAmountWei?: string;
} =>
  useMemo(() => {
    const expectedFee = Number((Number(inputWei) * 0.001) / 100).toFixed(2);
    const expectedToReceive = (Number(inputWei) / 100 - Number(expectedFee)).toFixed(2);
    const minimumAmount = limits?.[sourceChain]?.minAmount?.toNumber() || 0 / 100;
    const maximumAmount = limits?.[sourceChain]?.txLimit?.toNumber() || 0 / 100;
    const bridgeFee = fees?.[sourceChain]?.fee?.toNumber() || 0 / 100;
    const minFee = fees?.[sourceChain]?.minFee?.toNumber() || 0 / 100;
    const maxFee = fees?.[sourceChain]?.maxFee?.toNumber() || 0 / 100;
    const minAmountWei = limits?.[sourceChain]?.minAmount?.toString();

    return { expectedFee, expectedToReceive, minimumAmount, maximumAmount, bridgeFee, minFee, maxFee, minAmountWei };
  }, [limits, fees, sourceChain, inputWei]);

export const MicroBridge = ({
  useBalanceHook,
  useCanBridge,
  onBridge,
  onSetChain,
  limits,
  fees,
  bridgeStatus,
  relayStatus,
  selfRelayStatus
}: {
  onBridge: OnBridge;
  useBalanceHook: (chain: string) => string;
  useCanBridge: (chain: string, amountWei: string) => { isValid: boolean; reason: string };
  onSetChain?: (chain: string) => void;
  limits?: ILimits;
  fees?: IFees;
  bridgeStatus?: Partial<TransactionStatus>;
  relayStatus?: Partial<TransactionStatus>;
  selfRelayStatus?: Partial<TransactionStatus>;
}) => {
  const [isBridging, setBridging] = useState(false);
  const [inputWei, setInput] = useState<string>("0");
  const [enableTarget, setEnableTarget] = useState(false);

  const [target, setTarget] = useState<string | undefined>();

  const [sourceChain, setSourceChain] = useState<"fuse" | "celo">("fuse");

  const toggleEnableTarget = useCallback(() => setEnableTarget(value => !value), [setEnableTarget]);

  const targetChain = sourceChain === "fuse" ? "celo" : "fuse";
  const balanceWei = useBalanceHook(sourceChain);

  let { isValid, reason } = useCanBridge(sourceChain, inputWei);
  const hasBalance = Number(inputWei) <= Number(balanceWei);
  const isTargetValid = !enableTarget || isAddressValid(target || "");
  const isValidInput = isValid && hasBalance && isTargetValid;
  reason = reason || (!hasBalance && "balance") || (!isTargetValid && "target") || "";

  const toggleChains = useCallback(() => {
    setSourceChain(targetChain);
    onSetChain && onSetChain(targetChain);
  }, [setSourceChain, onSetChain, targetChain]);

  const triggerBridge = useCallback(async () => {
    setBridging(true);
    try {
      await onBridge(inputWei, sourceChain, enableTarget ? target : undefined);
    } catch (e) {
      setBridging(false);
    }
  }, [setBridging, onBridge, inputWei, sourceChain, enableTarget, target]);

  useEffect(() => {
    if (
      ["Fail", "Exception", "Success"].includes(relayStatus?.status || "") === false && //if bridge relayer failed or succeeded then we are done
      ["Success"].includes(selfRelayStatus?.status || "") === false && //if self relay succeeded then we are done, other wise we need to wait for relayStatus
      ["Mining", "PendingSignature", "Success"].includes(bridgeStatus?.status || "")
    ) {
      setBridging(true);
    } else {
      setBridging(false);
    }
  }, [relayStatus, bridgeStatus, selfRelayStatus]);

  const { expectedFee, expectedToReceive, minimumAmount, maximumAmount, bridgeFee, minFee, maxFee, minAmountWei } =
    useBridgeEstimate({ limits, fees, inputWei, sourceChain });

  return (
    <Box>
      <Flex direction="row" justifyContent={"space-between"} mb={"40px"}>
        <Box>
          <Text textTransform="capitalize">{sourceChain}</Text>
        </Box>
        <Switch boxSize="8" size="lg" isChecked={sourceChain === "fuse"} onToggle={toggleChains} />
        <Box>
          <Text textTransform="capitalize">{sourceChain === "fuse" ? "Celo" : "Fuse"}</Text>
        </Box>
      </Flex>
      <TokenInput balanceWei={balanceWei} decimals={2} onChange={setInput} minAmountWei={minAmountWei} />
      <FormControl isInvalid={!!reason}>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon variant="outline" />}>
          {reason}
        </FormControl.ErrorMessage>
      </FormControl>
      <Box mt="5">
        <Checkbox isChecked={enableTarget} value="" onChange={toggleEnableTarget}>
          Send to a different address
        </Checkbox>
        <AddressInput mt="2" onChange={setTarget} display={enableTarget ? "inherit" : "none"} />
      </Box>
      <Box mt="5">
        <HStack>
          <Text w={{ base: "1/2", sm: "1/4" }}>Fee</Text>
          <Text w={{ base: "1/2", sm: "1/4" }}>{expectedFee} G$</Text>
        </HStack>
        <HStack>
          <Text w={{ base: "1/2", sm: "1/4" }}>Expected to receive </Text>
          <Text w={{ base: "1/2", sm: "1/4" }}>{expectedToReceive} G$</Text>
        </HStack>
      </Box>
      <Button
        mt="5"
        onPress={triggerBridge}
        colorScheme="secondary"
        textTransform="capitalize"
        isLoading={isBridging}
        disabled={isBridging || isValidInput === false}
      >{`Bridge to ${targetChain}`}</Button>

      {limits?.[sourceChain] && fees?.[sourceChain] && (
        <Box mt="5">
          <Text>Minimum amount: {minimumAmount} G$</Text>
          <Text>Maximum amount: {maximumAmount} G$</Text>
          <HStack>
            <Text>Bridge fee: {bridgeFee}%</Text>
            <Text> (min fee: {minFee} G$</Text>
            <Text> max fee: {maxFee} G$)</Text>
          </HStack>
        </Box>
      )}
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
    </Box>
  );
};
