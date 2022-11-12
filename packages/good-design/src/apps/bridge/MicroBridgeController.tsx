import React, { useCallback, useState } from "react";
import { useTokenBalance, TransactionStatus, useEthers } from "@usedapp/core";
import {
  G$,
  SupportedChains,
  useGetEnvChainId,
  useRefreshOrNever,
  useBridge,
  useBridgeHistory,
  useRelayTx,
  useWithinBridgeLimits,
  useGetBridgeData
} from "@gooddollar/web3sdk-v2";
import { MicroBridge } from "./MicroBridge";
import { sortBy } from "lodash";
import { Box, Button, Flex, Heading, HStack, Text } from "native-base";
import { useSignWalletModal } from "../../hooks/useSignWalletModal";

const useBalanceHook = (chain: string) => {
  const env = useGetEnvChainId(chain === "fuse" ? SupportedChains.FUSE : SupportedChains.CELO);
  const refresh = useRefreshOrNever(12);
  const { account } = useEthers();
  const gdBalance = useTokenBalance(G$(env.chainId, env.defaultEnv).address, account, {
    refresh,
    chainId: env.chainId
  });
  return gdBalance?.toString() || "0";
};

const useCanBridge = (chain: string, amountWei: string) => {
  const { chainId } = useGetEnvChainId(chain === "fuse" ? SupportedChains.FUSE : SupportedChains.CELO);
  const { account } = useEthers();
  const canBridge = useWithinBridgeLimits(chainId, account || "", amountWei);
  return canBridge;
};

const MicroBridgeHistory = () => {
  const { fuseHistory, celoHistory } = useBridgeHistory();
  const historySorted = sortBy(
    (fuseHistory?.value || []).concat(celoHistory?.value || []),
    _ => _.data.from === "account"
  );
  const relayTx = useRelayTx();
  const [relaying, setRelaying] = useState<{ [key: string]: boolean }>({});

  const triggerRelay = useCallback(
    async (i: any) => {
      setRelaying({ ...relaying, [i.transactionHash]: true });
      try {
        const relayResult = await relayTx(
          i.data.targetChainId.toNumber() === 42220 ? 122 : 42220,
          i.data.targetChainId.toNumber(),
          i.transactionHash
        );
        if (relayResult.relayPromise) {
          relayResult.relayPromise.finally(() => setRelaying({ ...relaying, [i.transactionHash]: false }));
        } else {
          setRelaying({ ...relaying, [i.transactionHash]: false });
        }
      } catch (e) {
        setRelaying({ ...relaying, [i.transactionHash]: false });
      }
    },
    [setRelaying, relayTx]
  );

  return (
    <Box borderRadius={"md"} mt="4" borderWidth={"1"} padding="5">
      <Heading size="sm">Transactions History</Heading>
      <HStack alignContent={"center"} alignItems="center" justifyContent={"center"} mt="5">
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
      </HStack>

      {historySorted.map(i => (
        <HStack alignContent={"center"} alignItems="center" mt={2} key={i.transactionHash}>
          <Flex flex="2 1">
            <Text isTruncated>{i.transactionHash}</Text>
          </Flex>
          <Flex flex="2 0">
            <Text isTruncated>{i.data.from}</Text>
          </Flex>
          <Flex flex="2 0">
            <Text isTruncated>{i.data.to}</Text>
          </Flex>
          <Flex flex="1 0">
            <Text>{i.data.amount.toNumber() / 100}</Text>
          </Flex>
          <Flex flex="1 0">
            {(i as any).relayEvent ? (
              <Text>Completed</Text>
            ) : (
              <Button isLoading={relaying[i.transactionHash]} onPress={() => triggerRelay(i)}>
                Relay
              </Button>
            )}
          </Flex>
        </HStack>
      ))}
    </Box>
  );
};
export const MicroBridgeController = ({}) => {
  const { sendBridgeRequest, bridgeRequestStatus, relayStatus, selfRelayStatus } = useBridge();
  const { bridgeFees: fuseBridgeFees, bridgeLimits: fuseBridgeLimits } = useGetBridgeData(SupportedChains.FUSE, "");
  const { bridgeFees: celoBridgeFees, bridgeLimits: celoBridgeLimits } = useGetBridgeData(SupportedChains.CELO, "");
  const { SignWalletModal } = useSignWalletModal();

  return (
    <>
      <MicroBridge
        onBridge={sendBridgeRequest}
        useBalanceHook={useBalanceHook}
        useCanBridge={useCanBridge}
        bridgeStatus={bridgeRequestStatus}
        relayStatus={relayStatus as TransactionStatus}
        selfRelayStatus={selfRelayStatus}
        limits={{ fuse: fuseBridgeLimits, celo: celoBridgeLimits }}
        fees={{ fuse: fuseBridgeFees, celo: celoBridgeFees }}
      />
      <MicroBridgeHistory />
      <SignWalletModal txStatus={bridgeRequestStatus.status} />
      <SignWalletModal txStatus={selfRelayStatus?.status} />
    </>
  );
};
