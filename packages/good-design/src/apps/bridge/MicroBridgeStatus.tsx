import React from "react";
import {
  Box,
  CheckIcon,
  CloseIcon,
  Flex,
  HStack,
  IconButton,
  InfoOutlineIcon,
  Popover,
  Stack,
  Spinner,
  Text,
  VStack
} from "native-base";
import { useG$Amount } from "@gooddollar/web3sdk-v2";
import { ethers } from "ethers";
import { CurrencyValue, TransactionStatus } from "@usedapp/core";

import { GoodButton } from "../../core/buttons";
import { ExplorerLink } from "../../core";

import { GdAmount, Title } from "../../core/layout";

import { MicroBridgeProps } from "./types";
import { useWizard } from "react-use-wizard";
import { BridgeSuccessModal } from "../../core/web3/modals/BridgeSuccessModal";

const Status = ({ result, ...props }: { result?: string }) => {
  switch (result) {
    case undefined:
    case "Mining":
    case "PendingSignature":
    default:
      return <Spinner color="primary" borderWidth={0} size="sm" {...props} />;
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
  <Stack alignItems="center" p={2} direction={["column", "column", "row"]}>
    <HStack alignItems="center" flex="2 0">
      <Box>
        <Status result={txStatus?.status} />
      </Box>
      <Box flex={"1 1"}>
        <Text fontFamily="subheading" color="goodGrey.600" fontSize="2xs" ml="2">
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

const StatusHeader = ({
  sendAmount,
  sourceChain,
  targetChain,
  expectedToReceive,
  fee,
  relayStatus,
  withRelay
}: {
  sendAmount: CurrencyValue;
  sourceChain: string;
  targetChain: string;
  expectedToReceive: CurrencyValue;
  fee: CurrencyValue;
  relayStatus: MicroBridgeProps["relayStatus"];
  withRelay: MicroBridgeProps["withRelay"];
}) => {
  const [sendCopy, receiveCopy] =
    relayStatus?.status === "Success" ? ["You Bridged", "You've Received"] : ["You Have Bridged", "You Will Receive"];

  return (
    <>
      <VStack space={4} paddingBottom="4" borderBottomWidth={1} borderBottomColor="primary">
        <HStack justifyContent="space-between">
          <Text variant="sm-grey-700">{sendCopy}</Text>
          <GdAmount
            amount={sendAmount}
            withDefaultSuffix={false}
            options={{ prefix: `${sourceChain} G$ ` }}
            variant="md-grey-700"
          />
        </HStack>

        <HStack justifyContent="space-between">
          <Text variant="sm-grey-700">{receiveCopy}</Text>
          <GdAmount
            amount={expectedToReceive}
            withDefaultSuffix={false}
            options={{ prefix: `${targetChain} G$ ` }}
            variant="md-grey-700"
          />
        </HStack>

        <HStack justifyContent="space-between">
          <Text variant="sm-grey-700">{"Fees"}</Text>
          <GdAmount amount={fee} withDefaultSuffix={false} options={{ prefix: `G$ ` }} variant="md-grey-700" />
        </HStack>

        {relayStatus?.status === "Success" ? (
          <HStack justifyContent="space-between">
            <Text variant="sm-grey-700">{"Fees"}</Text>
            <GdAmount amount={fee} withDefaultSuffix={false} options={{ prefix: `G$ ` }} variant="md-grey-700" />
          </HStack>
        ) : null}
      </VStack>
      {relayStatus?.status !== "Success" ? (
        <VStack space={2} mt={2}>
          <Text fontSize="xs" fontFamily="subheading" fontWeight="400" lineHeight="18.2">
            You're paying <b>{fee.format({ suffix: "G$" })}</b> to use the bridge (See FAQ's for more no Fees)
          </Text>
          <Text fontSize="xs" fontFamily="subheading" fontWeight="400" lineHeight="18.2">
            The transaction may take a few minutes to complete.{" "}
            {withRelay ? (
              <Text>
                You can choose <b>Self Relay</b> to speed up the process and save 50% on fees!
              </Text>
            ) : null}
          </Text>
        </VStack>
      ) : null}
    </>
  );
};

export const SingleTxStatus = ({
  bridgeStatus,
  sourceChain,
  selfRelayStatus,
  relayStatus,
  handleFinish
}: {
  bridgeStatus: any;
  sourceChain: any;
  selfRelayStatus: any;
  relayStatus: any;
  handleFinish: any;
}) => (
  <VStack>
    <VStack>
      {bridgeStatus && bridgeStatus?.status != "None" && (
        <Box p={2} borderWidth="1" borderColor="primary" rounded="lg" bgColor="white">
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
    </VStack>
    {relayStatus?.status === "Success" ? (
      <>
        <BridgeSuccessModal open={relayStatus.status === "Success"} />
        <GoodButton onPress={handleFinish}>Done</GoodButton>
      </>
    ) : null}
  </VStack>
);

export const MicroBridgeStatus = ({
  originChain,
  pendingTransaction,
  relayStatus,
  withRelay
}: {
  bridgeStatus: MicroBridgeProps["bridgeStatus"];
  originChain: MicroBridgeProps["originChain"];
  pendingTransaction: MicroBridgeProps["pendingTransaction"];
  relayStatus: MicroBridgeProps["relayStatus"];
  withRelay: MicroBridgeProps["withRelay"];
}) => {
  const [pendingTx] = pendingTransaction;
  const [sourceChain] = originChain;
  const { bridgeWeiAmount, expectedToReceive } = pendingTx;
  const { goToStep } = useWizard();

  const sendAmount = useG$Amount(ethers.BigNumber.from(bridgeWeiAmount), "G$", sourceChain === "celo" ? 42220 : 122);
  const fee = sendAmount.sub(expectedToReceive);
  const targetChain = sourceChain === "celo" ? "fuse" : "celo";

  const handleFinish = () => {
    goToStep(0);
  };

  return (
    <VStack p={4} space={4} width="100%" bgColor="goodWhite.100">
      {relayStatus?.status === "Success" ? (
        <Title variant="title-gdblue">{`Congratulations! Your bridging \n transaction has been successfully \n completed.`}</Title>
      ) : (
        <Title variant="title-gdblue">{`Congratulations! Your bridging \n transaction is being processed.`}</Title>
      )}
      <StatusHeader
        {...{
          sendAmount,
          sourceChain,
          targetChain,
          expectedToReceive,
          fee,
          relayStatus,
          withRelay
        }}
      />
      <GoodButton onPress={handleFinish}>Done</GoodButton>
    </VStack>
  );
};
