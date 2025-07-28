import React, { FC } from "react";

import { SupportedChains } from "@gooddollar/web3sdk-v2";

import { ethers } from "ethers";

import { Box, FlatList, Flex, Heading, HStack, Spinner, Stack, VStack, Text } from "native-base";

import { Title } from "../../../core/layout";
import { ExplorerLink } from "../../../core/web3/ExplorerLink";
import { truncateMiddle } from "../../../utils";

// Import MPB functions from the mpbridge module
import { useMPBBridgeHistory, useGetMPBBridgeData } from "@gooddollar/web3sdk-v2";

const MPBBridgeHistory = () => {
  const { historySorted } = useMPBBridgeHistory() ?? {};

  return (
    <Box borderRadius="md" mt="4" borderWidth="1" padding="5">
      <Heading size="sm">MPB Bridge History</Heading>
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

      {!historySorted ? (
        <Spinner variant="page-loader" size="lg" />
      ) : (
        <FlatList
          shadow="1"
          _contentContainerStyle={{
            flexDirection: "column",
            width: "100%",
            minWidth: "384"
          }}
          data={historySorted}
          renderItem={({ item }: { item: any }) => (
            <HStack
              key={item.transactionHash}
              alignItems="center"
              justifyContent="space-between"
              p="2"
              borderBottomWidth="1"
              borderColor="goodGrey.300"
            >
              <Flex flex="1 1">
                <ExplorerLink
                  addressOrTx={item.transactionHash}
                  chainId={item.chainId}
                  text={truncateMiddle(item.transactionHash, 8)}
                />
              </Flex>
              <Flex flex="2 1">
                <Text fontSize="xs" color="goodGrey.600">
                  {item.sourceChain}
                </Text>
              </Flex>
              <Flex flex="2 0">
                <Text fontSize="xs" color="goodGrey.600">
                  {item.targetChain}
                </Text>
              </Flex>
              <Flex flex="1 0">
                <Text fontSize="xs" color="goodGrey.600">
                  {item.amount}
                </Text>
              </Flex>
              <Flex flex="1 0">
                <Text fontSize="xs" color="goodGrey.600">
                  {item.status || "Completed"}
                </Text>
              </Flex>
            </HStack>
          )}
          maxH="250"
          scrollEnabled={true}
          horizontal={false}
        />
      )}
    </Box>
  );
};

interface IMPBBridgeControllerProps {
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}

export const MPBBridgeController: FC<IMPBBridgeControllerProps> = () => {
  const { bridgeFees: fuseBridgeFees } = useGetMPBBridgeData(SupportedChains.FUSE, "");
  const { bridgeFees: celoBridgeFees } = useGetMPBBridgeData(SupportedChains.CELO, "");
  const { bridgeFees: mainnetBridgeFees } = useGetMPBBridgeData(SupportedChains.MAINNET, "");

  if (!fuseBridgeFees || !celoBridgeFees || !mainnetBridgeFees) {
    return <Spinner variant="page-loader" size="lg" />;
  }

  return (
    <>
      <VStack space={4} width="100%" alignSelf="center">
        <Title variant="title-gdblue">Main Bridge (MPB)</Title>
        <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600" textAlign="center">
          Bridge G$ between Fuse, Celo, and Mainnet using LayerZero/Axelar
        </Text>

        <Box borderRadius="md" borderWidth="1" padding="5" backgroundColor="goodWhite.100">
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontFamily="heading" fontSize="md" fontWeight="700">
                Bridge Configuration
              </Text>
            </HStack>

            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text fontFamily="subheading" fontSize="xs" color="goodGrey.600">
                  Fuse Bridge Fee:
                </Text>
                <Text fontFamily="subheading" fontSize="xs" color="goodGrey.700">
                  {fuseBridgeFees.nativeFee
                    ? `${ethers.utils.formatEther(fuseBridgeFees.nativeFee)} ETH`
                    : "Calculating..."}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontFamily="subheading" fontSize="xs" color="goodGrey.600">
                  Celo Bridge Fee:
                </Text>
                <Text fontFamily="subheading" fontSize="xs" color="goodGrey.700">
                  {celoBridgeFees.nativeFee
                    ? `${ethers.utils.formatEther(celoBridgeFees.nativeFee)} ETH`
                    : "Calculating..."}
                </Text>
              </HStack>

              <HStack justifyContent="space-between">
                <Text fontFamily="subheading" fontSize="xs" color="goodGrey.600">
                  Mainnet Bridge Fee:
                </Text>
                <Text fontFamily="subheading" fontSize="xs" color="goodGrey.700">
                  {mainnetBridgeFees.nativeFee
                    ? `${ethers.utils.formatEther(mainnetBridgeFees.nativeFee)} ETH`
                    : "Calculating..."}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <MPBBridgeHistory />
      </VStack>
    </>
  );
};
