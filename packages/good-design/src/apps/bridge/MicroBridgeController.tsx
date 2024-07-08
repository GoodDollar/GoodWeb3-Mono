import React, { FC, useCallback, useState } from "react";

import {
  G$Amount,
  SupportedChains,
  useBridge,
  useBridgeHistory,
  useGetBridgeData,
  useGetEnvChainId,
  useRelayTx,
  useWithinBridgeLimits
} from "@gooddollar/web3sdk-v2";

import moment from "moment";
import { ethers } from "ethers";

import { useEthers } from "@usedapp/core";
import { noop, sortBy } from "lodash";
import {
  ArrowForwardIcon,
  Box,
  Button,
  FlatList,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Spinner,
  Stack,
  VStack,
  Text
} from "native-base";

import { GdAmount, Title } from "../../core/layout";
import { ExplorerLink } from "../../core/web3/ExplorerLink";
import { BridgeWizard } from "./wizard/BridgeWizard";
import { truncateMiddle } from "../../utils";

const useCanBridge = (chain: "fuse" | "celo", amountWei: string) => {
  const { chainId } = useGetEnvChainId(chain === "fuse" ? SupportedChains.FUSE : SupportedChains.CELO);
  const { account } = useEthers();
  const canBridge = useWithinBridgeLimits(chainId, account || "", amountWei);

  return canBridge;
};

const BridgeHistoryWithRelay = () => {
  const { fuseHistory, celoHistory } = useBridgeHistory();

  const historySorted = sortBy((fuseHistory || []).concat(celoHistory || []), _ => _.data.from === "account");

  const relayTx = useRelayTx();
  const [relaying, setRelaying] = useState<{ [key: string]: boolean }>({});

  const triggerRelay = useCallback(
    async (i: any) => {
      console.log("relay triggered", { i });
      setRelaying({ ...relaying, [i.transactionHash]: true });
      try {
        const relayResult = await relayTx(
          i.data.targetChainId.toNumber() === 42220 ? 122 : 42220,
          i.data.targetChainId.toNumber(),
          i.transactionHash
        );
        if (!relayResult.relayPromise) {
          setRelaying({ ...relaying, [i.transactionHash]: false });
        }
      } catch (e) {
        console.log("triggerRelay failed -->", { e });
        setRelaying({ ...relaying, [i.transactionHash]: false });
      }
    },
    [setRelaying, relayTx]
  );

  return (
    <Box borderRadius="md" mt="4" borderWidth="1" padding="5">
      <Heading size="sm">Transactions History</Heading>
      <Stack
        direction={["column", "column", "row"]}
        alignContent="center"
        alignItems="center"
        justifyContent="center"
        mt="5"
      >
        <Flex flex="1 1"></Flex>
        <Flex flex="2 1">
          <Heading size="xs">Transaction Hash</Heading>
        </Flex>
        <Flex flex="2 0">
          <Heading size="xs">From</Heading>
        </Flex>
        <Flex flex="2 0">
          <Heading size="xs">To</Heading>
        </Flex>
        <Flex flex="1 0">
          <Heading size="xs">Amount</Heading>
        </Flex>
        <Flex flex="1 0">
          <Heading size="xs">Status</Heading>
        </Flex>
      </Stack>

      {historySorted.map(i => (
        <Stack
          direction={["column", "column", "row"]}
          alignContent="center"
          alignItems={["flex-start", "flex-start", "center"]}
          mt={2}
          key={i.transactionHash}
          space="2"
          borderWidth={["1", "1", "0"]}
          padding={["2", "2", "0"]}
          borderRadius={["md", "md", "none"]}
        >
          <HStack flex="1 1" alignItems="center">
            <Text flex="1 0">{i.data.targetChainId.toNumber() === 122 ? "Celo" : "Fuse"}</Text>
            <ArrowForwardIcon size="3" color="black" ml="1" mr="1" flex="auto 0" />
            <Text flex="1 0">{i.data.targetChainId.toNumber() === 122 ? "Fuse" : "Celo"}</Text>
          </HStack>
          <Flex flex={["1 1", "1 1", "2 0"]} maxWidth="100%">
            <ExplorerLink
              chainId={i.data.targetChainId.toNumber() === 122 ? 42220 : 122}
              addressOrTx={i.transactionHash}
            />
          </Flex>
          <Flex flex={["1 1", "1 1", "2 0"]} maxWidth="100%">
            <ExplorerLink chainId={i.data.targetChainId.toNumber() === 122 ? 42220 : 122} addressOrTx={i.data.from} />
          </Flex>
          <Flex flex={["1 1", "1 1", "2 0"]} maxWidth="100%">
            <ExplorerLink chainId={i.data.targetChainId.toNumber() === 122 ? 42220 : 122} addressOrTx={i.data.to} />
          </Flex>
          <Flex flex={["1 1", "1 1", "1 0"]} maxWidth="100%">
            <Text>{i.amount} G$</Text>
          </Flex>
          <Flex flex={["1 1", "1 1", "1 0"]} maxWidth="100%">
            {(i as any).relayEvent ? (
              <ExplorerLink
                chainId={i.data.targetChainId.toNumber()}
                addressOrTx={(i as any).relayEvent.transactionHash}
                text="Completed"
              />
            ) : (
              <Button isLoading={relaying[i.transactionHash]} onPress={() => triggerRelay(i)}>
                Relay
              </Button>
            )}
          </Flex>
        </Stack>
      ))}
    </Box>
  );
};

const HistoryRowItem = ({ item, env }: { item: any; env: string }) => {
  const { amount, data, relayEvent, transactionHash } = item;
  const { targetChainId, timestamp } = data || {};

  const { fee } = relayEvent?.data || {};

  const date = moment(ethers.BigNumber.from(timestamp).toNumber() * 1000).utc();
  const dateFormatted = date.format("DD.MM.YY");
  const dateHours = date.format("HH:mm");

  const targetChain = parseInt(targetChainId);
  const sourceChain = targetChain === 122 ? 42220 : 122;
  const test = 12223;

  const feeFormatted = fee && targetChain ? G$Amount("G$", ethers.BigNumber.from(fee), targetChain, env) : null;

  return (
    <HStack marginTop="3" space="35" flex="1 1 100%">
      <VStack>
        <Text variant="xs-grey">{dateFormatted}</Text>
        <Text variant="xs-grey">{dateHours}</Text>
      </VStack>
      <VStack flex="0 0 15%" alignItems="flex-start">
        <Text variant="xs-grey">G$ {amount}</Text>
        {feeFormatted ? (
          <HStack>
            <Text variant="xs-grey" fontWeight="700">
              Fees:{" "}
            </Text>
            <Text variant="xs-grey">{`G$ `}</Text>
            <GdAmount variant="xs-grey" fontFamily="subheading" withDefaultSuffix={false} amount={feeFormatted} />
          </HStack>
        ) : (
          <Skeleton size="3" rounded="full" width="75%" />
        )}
      </VStack>
      <VStack flex="2 2 25%" alignItems="flex-start">
        {relayEvent?.transactionHash && targetChain && test === 12223 ? (
          <>
            <Text variant="xs-green">Completed</Text>
            <HStack space="2" alignItems="center">
              <Text variant="xs-grey">{`(Received on ${SupportedChains[targetChain]})`}</Text>
              <ExplorerLink
                fontSize="xs"
                chainId={targetChain}
                addressOrTx={relayEvent.transactionHash}
                text={truncateMiddle(relayEvent.transactionHash, 11)}
                withIcon={false}
              />
            </HStack>
          </>
        ) : (
          <>
            <HStack space="2">
              <Spinner variant="page-loader" size="sm" />
              <Text variant="xs-grey">{`Waiting for bridge relayers to relay to target chain... \n (Can take a few minutes)`}</Text>
            </HStack>
            <HStack space="2" alignItems="center">
              <Text variant="xs-grey">{`(Send on ${SupportedChains[sourceChain]})`}</Text>
              <ExplorerLink
                fontSize="xs"
                chainId={sourceChain}
                addressOrTx={transactionHash}
                text={truncateMiddle(transactionHash, 11)}
                withIcon={false}
              />
            </HStack>
          </>
        )}
      </VStack>
    </HStack>
  );
};

const BridgeHistory = ({ env }: { env: string }) => {
  const { historySorted } = useBridgeHistory();

  return (
    <VStack>
      <Title variant="title-gdblue" py="6" width="100%">
        Recent Transactions
      </Title>
      <VStack space="2">
        <HStack borderBottomWidth="1" borderBottomColor="goodGrey.300:alpha.70">
          <Text flex="0 0 11%" variant="sm-grey-600" fontWeight="700">
            Date
          </Text>
          <Text flex="1 1 12%" variant="sm-grey-600" fontWeight="700">
            Amount
          </Text>
          <Text flex="2 2 55%" variant="sm-grey-600" fontWeight="700">
            Status
          </Text>
        </HStack>
        {historySorted.length === 0 ? (
          <Spinner variant="page-loader" size="lg" />
        ) : (
          <FlatList
            shadow="1"
            _contentContainerStyle={{
              flexDirection: "column",
              width: "100%"
            }}
            data={historySorted}
            renderItem={({ item }) => <HistoryRowItem item={item} env={env} />}
            maxH="250"
            scrollEnabled={true}
            horizontal={false}
          />
        )}
      </VStack>
    </VStack>
  );
};

interface IMicroBridgeControllerProps {
  withRelay?: boolean;
  withHistory?: boolean;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}

export const MicroBridgeController: FC<IMicroBridgeControllerProps> = ({
  withRelay = false,
  withHistory = true,
  // onBridgeStart = noop,
  onBridgeSuccess = noop,
  onBridgeFailed = noop
}: IMicroBridgeControllerProps) => {
  const { chainId } = useEthers();
  const { defaultEnv } = useGetEnvChainId();
  const { sendBridgeRequest, bridgeRequestStatus, relayStatus, selfRelayStatus } = useBridge();
  const { bridgeFees: fuseBridgeFees, bridgeLimits: fuseBridgeLimits } = useGetBridgeData(SupportedChains.FUSE, "");
  const { bridgeFees: celoBridgeFees, bridgeLimits: celoBridgeLimits } = useGetBridgeData(SupportedChains.CELO, "");
  const inputTransaction = useState<string>("0");
  const pendingTransaction = useState<any>(false);
  const originChain = useState<"fuse" | "celo">(chainId === 122 ? "fuse" : "celo");

  const onBridgeStart = useCallback(async () => {
    const [inputWei] = inputTransaction;

    try {
      await sendBridgeRequest(inputWei, originChain[0]);
    } catch (e) {
      console.error("sendBridgeRequest failed", { e });
      // onBridgeFailed();
    }
  }, [inputTransaction, originChain]);

  if (!fuseBridgeFees || !celoBridgeFees) return <Spinner variant="page-loader" size="lg" />;

  return (
    <>
      <BridgeWizard
        useCanBridge={useCanBridge}
        bridgeStatus={bridgeRequestStatus}
        relayStatus={relayStatus}
        selfRelayStatus={selfRelayStatus}
        originChain={originChain}
        limits={{ fuse: fuseBridgeLimits, celo: celoBridgeLimits }}
        fees={{ fuse: fuseBridgeFees, celo: celoBridgeFees }}
        onBridgeStart={onBridgeStart}
        onBridgeSuccess={onBridgeSuccess}
        onBridgeFailed={onBridgeFailed}
        inputTransaction={inputTransaction}
        pendingTransaction={pendingTransaction}
      />
      {withRelay && <BridgeHistoryWithRelay />}
      {withHistory && <BridgeHistory env={defaultEnv} />}
    </>
  );
};
