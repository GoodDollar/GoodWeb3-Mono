import React from "react";
import { Box, HStack, Pressable, ChevronDownIcon, Text, VStack } from "native-base";
import { getChainIcon, getChainColor, getChainLabel, getValidTargetChains } from "./utils";

interface ChainSelectorProps {
  sourceChain: string;
  targetChain: string;
  showSourceDropdown: boolean;
  showTargetDropdown: boolean;
  bridgeFees: any;
  bridgeProvider: string;
  feesLoading: boolean;
  onSourceChainSelect: (chain: string) => void;
  onTargetChainSelect: (chain: string) => void;
  onSwap: () => void;
  onSourceDropdownToggle: () => void;
  onTargetDropdownToggle: () => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  sourceChain,
  targetChain,
  showSourceDropdown,
  showTargetDropdown,
  bridgeFees,
  bridgeProvider,
  feesLoading,
  onSourceChainSelect,
  onTargetChainSelect,
  onSwap,
  onSourceDropdownToggle,
  onTargetDropdownToggle
}) => {
  const availableChains = ["fuse", "celo", "mainnet"];

  return (
    <HStack space={4} alignItems="center" zIndex={1000}>
      {/* Source Chain */}
      <VStack
        flex={1}
        bg="white"
        borderRadius="lg"
        padding={2}
        borderWidth="1"
        borderColor="goodGrey.300"
        position="relative"
        style={{ overflow: "visible" }}
      >
        <HStack space={3} alignItems="center">
          <Box
            bg={getChainColor(sourceChain)}
            borderRadius="full"
            width="8"
            height="8"
            alignItems="center"
            justifyContent="center"
            shadow="sm"
          >
            <Text color="white" fontSize="sm" fontWeight="bold">
              {getChainIcon(sourceChain)}
            </Text>
          </Box>
          <Pressable
            flex={1}
            onPress={onSourceDropdownToggle}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text color="goodGrey.700" fontSize="md" fontWeight="600">
              {getChainLabel(sourceChain)}
            </Text>
            <Box style={{ transform: [{ rotate: showSourceDropdown ? "180deg" : "0deg" }] }}>
              <ChevronDownIcon size="sm" color="goodGrey.400" />
            </Box>
          </Pressable>
        </HStack>

        {/* Source Chain Dropdown */}
        {showSourceDropdown && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bg="white"
            borderRadius="lg"
            borderWidth="1"
            borderColor="goodGrey.300"
            shadow="xl"
            zIndex={999999}
            mt={1}
            minWidth="200px"
            maxWidth="300px"
            style={{
              position: "absolute",
              zIndex: 999999,
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              minWidth: "200px",
              maxWidth: "300px"
            }}
          >
            {availableChains.map(chain => (
              <Pressable
                key={chain}
                onPress={() => onSourceChainSelect(chain)}
                padding={4}
                borderBottomWidth={chain === availableChains[availableChains.length - 1] ? 0 : 1}
                borderBottomColor="goodGrey.200"
                _pressed={{ bg: "goodGrey.100" }}
              >
                <HStack space={3} alignItems="center">
                  <Box
                    bg={getChainColor(chain)}
                    borderRadius="full"
                    width="6"
                    height="6"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontSize="xs" fontWeight="bold">
                      {getChainIcon(chain)}
                    </Text>
                  </Box>
                  <Text color="goodGrey.700" fontSize="md" fontWeight="500">
                    {getChainLabel(chain)}
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </Box>
        )}
      </VStack>

      {/* Swap Arrow */}
      <Pressable
        onPress={onSwap}
        bg="goodGrey.200"
        borderRadius="full"
        width="8"
        height="8"
        alignItems="center"
        justifyContent="center"
        shadow="sm"
        _pressed={{ bg: "goodGrey.300" }}
      >
        <Text fontSize="xl" color="goodGrey.600" fontWeight="bold">
          ⇄
        </Text>
      </Pressable>

      {/* Target Chain */}
      <VStack
        bg="white"
        borderRadius="lg"
        padding={2}
        borderWidth="1"
        borderColor="goodGrey.300"
        flex={1}
        position="relative"
        style={{ overflow: "visible" }}
      >
        <HStack space={3} alignItems="center">
          <Box
            bg={getChainColor(targetChain)}
            borderRadius="full"
            width="8"
            height="8"
            alignItems="center"
            justifyContent="center"
            shadow="sm"
          >
            <Text color="white" fontSize="sm" fontWeight="bold">
              {getChainIcon(targetChain)}
            </Text>
          </Box>
          <Pressable
            flex={1}
            onPress={onTargetDropdownToggle}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text color="goodGrey.700" fontSize="md" fontWeight="600">
              {getChainLabel(targetChain)}
            </Text>
            <Box style={{ transform: [{ rotate: showTargetDropdown ? "180deg" : "0deg" }] }}>
              <ChevronDownIcon size="sm" color="goodGrey.400" />
            </Box>
          </Pressable>
        </HStack>

        {/* Target Chain Dropdown */}
        {showTargetDropdown && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bg="white"
            borderRadius="lg"
            borderWidth="1"
            borderColor="goodGrey.300"
            shadow="xl"
            zIndex={999999}
            mt={1}
            minWidth="200px"
            maxWidth="300px"
            style={{
              position: "absolute",
              zIndex: 999999,
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              minWidth: "200px",
              maxWidth: "300px"
            }}
          >
            {getValidTargetChains(sourceChain, bridgeFees, bridgeProvider, feesLoading).map(chain => (
              <Pressable
                key={chain}
                onPress={() => onTargetChainSelect(chain)}
                padding={4}
                borderBottomWidth={
                  chain === getValidTargetChains(sourceChain, bridgeFees, bridgeProvider, feesLoading).slice(-1)[0]
                    ? 0
                    : 1
                }
                borderBottomColor="goodGrey.200"
                _pressed={{ bg: "goodGrey.100" }}
              >
                <HStack space={3} alignItems="center">
                  <Box
                    bg={getChainColor(chain)}
                    borderRadius="full"
                    width="6"
                    height="6"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontSize="xs" fontWeight="bold">
                      {getChainIcon(chain)}
                    </Text>
                  </Box>
                  <Text color="goodGrey.700" fontSize="md" fontWeight="500">
                    {getChainLabel(chain)}
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </Box>
        )}
      </VStack>
    </HStack>
  );
};
