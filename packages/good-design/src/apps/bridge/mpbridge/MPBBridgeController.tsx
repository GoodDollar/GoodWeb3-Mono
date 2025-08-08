import React, { FC, useMemo } from "react";

import { SupportedChains } from "@gooddollar/web3sdk-v2";

import { ethers } from "ethers";

import { Box, Spinner, VStack, Text, HStack } from "native-base";

import { Title } from "../../../core/layout";

// Import MPB functions from the mpbridge module
import { useMPBBridgeHistory, useGetMPBBridgeData } from "@gooddollar/web3sdk-v2";

import { BridgeTransactionList, BridgeTransaction } from "./MPBBridgeTransactionCard";

const MPBBridgeHistory = () => {
  const { historySorted } = useMPBBridgeHistory() ?? {};

  // Transform SDK history data to BridgeTransaction format
  const bridgeTransactions: BridgeTransaction[] = useMemo(() => {
    if (!historySorted || !Array.isArray(historySorted)) {
      return [];
    }

    return historySorted.map((tx: any, index: number) => {
      // Use bridge provider from SDK data, fallback to chain-based logic
      const bridgeProvider: "axelar" | "layerzero" =
        tx.bridgeProvider || (tx.sourceChain === "Fuse" ? "axelar" : "layerzero");

      // Determine status based on transaction data
      // In a real implementation, this would come from the transaction status
      const status: "completed" | "pending" | "failed" | "bridging" = tx.status || "completed";

      return {
        id: tx.transactionHash || `tx-${index}`,
        transactionHash: tx.transactionHash || "",
        sourceChain: tx.sourceChain || "Unknown",
        targetChain: tx.targetChain || "Unknown",
        amount: tx.amount || "0",
        bridgeProvider,
        status,
        date: new Date(), // Use current date as fallback since blockTimestamp is not available
        chainId: tx.chainId || 122
      };
    });
  }, [historySorted]);

  return (
    <Box borderRadius="md" mt="4" borderWidth="1" padding="5">
      <Title variant="title-gdblue" mb={4}>
        Recent Bridge Transactions (Last 30 days)
      </Title>

      {!historySorted ? (
        <Spinner variant="page-loader" size="lg" />
      ) : (
        <BridgeTransactionList
          transactions={bridgeTransactions}
          onTxDetailsPress={tx => console.log("Transaction details:", tx)}
          limit={5}
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
