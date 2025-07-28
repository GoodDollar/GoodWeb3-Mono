import React, { FC } from "react";

import { SupportedChains } from "@gooddollar/web3sdk-v2";

import { ethers } from "ethers";

import { Box, Spinner, VStack, Text, HStack } from "native-base";

import { Title } from "../../../core/layout";

// Import MPB functions from the mpbridge module
import { useGetMPBBridgeData } from "@gooddollar/web3sdk-v2";

import { BridgeTransactionList, BridgeTransaction } from "./MPBBridgeTransactionCard";

// Mock bridge transaction data for demonstration
const mockBridgeTransactions: BridgeTransaction[] = [
  {
    id: "1",
    transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
    sourceChain: "Celo",
    targetChain: "Fuse",
    amount: "100,000",
    bridgeProvider: "axelar",
    status: "completed",
    date: new Date("2025-07-13T16:06:00"),
    chainId: 42220
  },
  {
    id: "2",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef12",
    sourceChain: "Celo",
    targetChain: "Ethereum",
    amount: "5,000",
    bridgeProvider: "layerzero",
    status: "completed",
    date: new Date("2025-07-11T13:21:00"),
    chainId: 42220
  },
  {
    id: "3",
    transactionHash: "0x7890abcdef1234567890abcdef1234567890abcd",
    sourceChain: "Fuse",
    targetChain: "Celo",
    amount: "50,000",
    bridgeProvider: "axelar",
    status: "completed",
    date: new Date("2025-07-10T09:15:00"),
    chainId: 122
  }
];

const MPBBridgeHistory = () => {
  return (
    <Box borderRadius="md" mt="4" borderWidth="1" padding="5">
      <Title variant="title-gdblue" mb={4}>
        Recent Bridge Transactions (Last 30 days)
      </Title>

      <BridgeTransactionList
        transactions={mockBridgeTransactions}
        onTxDetailsPress={tx => console.log("Transaction details:", tx)}
        limit={5}
      />
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
