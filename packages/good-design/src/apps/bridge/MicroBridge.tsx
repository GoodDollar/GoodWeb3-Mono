import React, { useEffect, useCallback, useState } from "react";
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
  <Stack mt="2" alignItems={"center"} direction={["column", "column", "row"]}>
    <HStack alignItems={"center"} flex="2 0">
      <Box>
        <Status result={txStatus?.status} />
      </Box>
      <Box flex={"1 1"}>
        <Text color="emerald.500" fontSize="md" ml="2">
          {text}
        </Text>
      </Box>
      {infoText && (
        <Popover
          trigger={triggerProps => {
            return <IconButton {...triggerProps} icon={<InfoOutlineIcon />} />;
          }}
        >
          <Popover.Content accessibilityLabel={infoText} w="md">
            <Popover.CloseButton />
            <Popover.Body>{infoText}</Popover.Body>
          </Popover.Content>
        </Popover>
      )}
    </HStack>
    <Flex flex={"1 1"} alignItems={"center"} maxWidth="100%">
      {txStatus && <ExplorerLink chainId={txStatus.chainId} addressOrTx={txStatus.transaction?.hash} />}
    </Flex>
  </Stack>
);

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
  limits?: {
    [key: string]: { dailyLimit: BigNumber; txLimit: BigNumber; accountDailyLimit: BigNumber; minAmount: BigNumber };
  };
  fees?: { [key: string]: { minFee: BigNumber; maxFee: BigNumber; fee: BigNumber } };
  bridgeStatus?: Partial<TransactionStatus>;
  relayStatus?: Partial<TransactionStatus>;
  selfRelayStatus?: Partial<TransactionStatus>;
}) => {
  const [isBridging, setBridging] = useState(false);
  const [inputWei, setInput] = useState<string>("0");
  const expectedFee = Number((Number(inputWei) * 0.001) / 100).toFixed(2);
  const [enableTarget, setEnableTarget] = useState(false);

  const [target, setTarget] = useState<string | undefined>();

  const [sourceChain, setSourceChain] = useState<"fuse" | "celo">("fuse");

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
      ["Mining", "PendingSignature", "Success"].includes(bridgeStatus?.status || "") &&
      (["None", "Fail", "Exception", "Success"].includes(selfRelayStatus?.status || "") &&
        ["None", "Fail", "Exception", "Success"].includes(relayStatus?.status || "")) === false
    ) {
      setBridging(true);
    } else {
      setBridging(false);
    }
  }, [relayStatus, bridgeStatus, selfRelayStatus]);

  return (
    <Box>
      <Flex direction="row" justifyContent={"space-between"}>
        <Box>
          <Text textTransform="capitalize">{sourceChain}</Text>
        </Box>
        <Switch boxSize="8" size="lg" isChecked={sourceChain === "fuse"} onToggle={toggleChains} />
        <Box>
          <Text textTransform="capitalize">{sourceChain === "fuse" ? "Celo" : "Fuse"}</Text>
        </Box>
      </Flex>
      <TokenInput
        balanceWei={balanceWei}
        decimals={2}
        onChange={setInput}
        minAmountWei={limits?.[sourceChain]?.minAmount?.toString()}
      />
      <FormControl isInvalid={!!reason}>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon variant="outline" />}>
          {reason}
        </FormControl.ErrorMessage>
      </FormControl>
      <Box mt="5">
        <Checkbox isChecked={enableTarget} value="" onChange={() => setEnableTarget(!enableTarget)}>
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
          <Text w={{ base: "1/2", sm: "1/4" }}>{(Number(inputWei) / 100 - Number(expectedFee)).toFixed(2)} G$</Text>
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
          <Text>Minimum amount: {limits?.[sourceChain]?.minAmount?.toNumber() || 0 / 100} G$</Text>
          <Text>Maximum amount: {limits?.[sourceChain]?.txLimit?.toNumber() || 0 / 100} G$</Text>
          <HStack>
            <Text>Bridge fee: {fees?.[sourceChain]?.fee?.toNumber() / 100}%</Text>
            <Text> (min fee: {fees?.[sourceChain]?.minFee?.toNumber() / 100} G$</Text>
            <Text> max fee: {fees?.[sourceChain]?.maxFee?.toNumber() / 100} G$)</Text>
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
