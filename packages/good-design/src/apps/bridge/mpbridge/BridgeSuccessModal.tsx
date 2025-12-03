import React from "react";
import { Modal, Text, VStack, HStack, Button, Center, Divider, Box } from "native-base";
import { BigNumber, utils } from "ethers";

interface BridgeSuccessModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    bridgeProvider: string;
    sourceChain: string;
    targetChain: string;
    amount: string; // Wei string
    protocolFeePercent?: number;
    networkFee?: BigNumber; // G$ value
    txHash?: string;
  };
  onTrackTransaction: () => void;
}

export const BridgeSuccessModal = ({ open, onClose, data, onTrackTransaction }: BridgeSuccessModalProps) => {
  const {
    bridgeProvider,
    sourceChain,
    targetChain,
    amount,
    protocolFeePercent = 0,
    networkFee = BigNumber.from(0)
  } = data;

  const amountBN = BigNumber.from(amount || "0");
  const amountFormatted = utils.formatEther(amountBN);
  
  const protocolFeeBN = amountBN.mul(Math.floor(protocolFeePercent * 10000)).div(10000);
  const protocolFeeFormatted = utils.formatEther(protocolFeeBN);
  
  const networkFeeFormatted = utils.formatEther(networkFee);

  const totalFeesBN = protocolFeeBN.add(networkFee);
  const totalFeesFormatted = utils.formatEther(totalFeesBN);

  const receiveAmountBN = amountBN.sub(totalFeesBN);
  const receiveFormatted = utils.formatEther(receiveAmountBN.lt(0) ? 0 : receiveAmountBN);

  return (
    <Modal isOpen={open} onClose={onClose} size="lg">
      <Modal.Content maxWidth="450px" borderRadius="2xl">
        <Modal.Body padding={8} bg="white">
          <VStack space={6} alignItems="center">
            <Center bg="blue.50" rounded="full" p={4} width="80px" height="80px">
               <Text fontSize="4xl" color="blue.500">✓</Text> 
            </Center>

            <VStack space={2} alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500" textAlign="center">
                Transaction Submitted!
              </Text>
              <Text fontSize="md" color="gray.500" textAlign="center">
                Your bridging transaction via {capitalize(bridgeProvider)} is being processed.
              </Text>
            </VStack>

            <Divider my={2} />

            <VStack space={4} width="100%">
              <HStack justifyContent="space-between" alignItems="center">
                <Text color="gray.500" fontSize="md">You Have Bridged</Text>
                <Text fontWeight="bold" fontSize="md">G$ {capitalize(sourceChain)} {formatCurrency(amountFormatted)}</Text>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <Text color="gray.500" fontSize="md">You Will Receive (Est.)</Text>
                <Text fontWeight="bold" fontSize="md">G$ {capitalize(targetChain)} {formatCurrency(receiveFormatted)}</Text>
              </HStack>
            </VStack>

            <Divider my={2} />

            <VStack space={2} width="100%">
              <HStack justifyContent="space-between" alignItems="center">
                 <Text fontWeight="bold" fontSize="md">Total Fees</Text>
                 <Text fontWeight="bold" fontSize="md">G$ {formatCurrency(totalFeesFormatted)}</Text>
              </HStack>
              
              <HStack justifyContent="space-between" pl={2} alignItems="center">
                 <Text color="gray.400" fontSize="sm">Bridge Fee ({(protocolFeePercent * 100).toFixed(2)}%)</Text>
                 <Text color="gray.400" fontSize="sm">{formatCurrency(protocolFeeFormatted)} G$</Text>
              </HStack>

              <HStack justifyContent="space-between" pl={2} alignItems="center">
                 <Text color="gray.400" fontSize="sm">Network Fee</Text>
                 <Text color="gray.400" fontSize="sm">{formatCurrency(networkFeeFormatted)} G$</Text>
              </HStack>
            </VStack>
            
            <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
              The transaction may take a few minutes to complete. You can close this window.
            </Text>

            <HStack space={4} width="100%" mt={2}>
               <Button flex={1} variant="solid" bg="blue.500" _text={{ color: "white" }} onPress={onClose} borderRadius="full">
                 Done
               </Button>
               <Button flex={1} variant="outline" borderColor="gray.300" _text={{ color: "gray.600" }} onPress={onTrackTransaction} borderRadius="full">
                 Track Transaction
               </Button>
            </HStack>

          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

const formatCurrency = (val: string) => {
  return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

