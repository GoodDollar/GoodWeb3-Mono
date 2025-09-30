import React, { memo, useMemo } from "react";
import { Box, HStack, Pressable, ChevronDownIcon, Text, VStack } from "native-base";
import { getChainIcon, getChainColor, getChainLabel, getValidTargetChains } from "./utils";

// Style objects defined outside component for reusability and cleaner renders
const chainContainerStyles = {
  flex: 1,
  bg: "white",
  borderRadius: "lg",
  padding: 2,
  borderWidth: "1",
  borderColor: "goodGrey.300",
  position: "relative",
  style: { overflow: "visible" }
} as const;

const chainIconStyles = {
  borderRadius: "full",
  width: "8",
  height: "8",
  alignItems: "center",
  justifyContent: "center",
  shadow: "sm"
} as const;

const chainPressableStyles = {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between"
} as const;

const dropdownStyles = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  bg: "white",
  borderRadius: "lg",
  borderWidth: "1",
  borderColor: "goodGrey.300",
  shadow: "xl",
  zIndex: 999999,
  mt: 1,
  minWidth: "200px",
  maxWidth: "300px"
} as const;

const dropdownItemStyles = {
  padding: 4,
  borderBottomWidth: 1,
  borderBottomColor: "goodGrey.200",
  _pressed: { bg: "goodGrey.100" }
} as const;

const swapButtonStyles = {
  bg: "goodGrey.200",
  borderRadius: "full",
  width: "8",
  height: "8",
  alignItems: "center",
  justifyContent: "center",
  shadow: "sm",
  _pressed: { bg: "goodGrey.300" }
} as const;

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

export const ChainSelector: React.FC<ChainSelectorProps> = memo(
  ({
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
    const availableChains = useMemo(() => ["fuse", "celo", "mainnet"], []);

    const validTargetChains = useMemo(
      () => getValidTargetChains(sourceChain, bridgeFees, bridgeProvider, feesLoading),
      [sourceChain, bridgeFees, bridgeProvider, feesLoading]
    );

    return (
      <HStack space={4} alignItems="center" zIndex={1000}>
        {/* Source Chain */}
        <VStack {...chainContainerStyles}>
          <HStack space={3} alignItems="center">
            <Box bg={getChainColor(sourceChain)} {...chainIconStyles}>
              <Text color="white" fontSize="sm" fontWeight="bold">
                {getChainIcon(sourceChain)}
              </Text>
            </Box>
            <Pressable onPress={onSourceDropdownToggle} {...chainPressableStyles}>
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
            <Box {...dropdownStyles}>
              {availableChains.map(chain => (
                <Pressable
                  key={chain}
                  onPress={() => onSourceChainSelect(chain)}
                  {...dropdownItemStyles}
                  borderBottomWidth={chain === availableChains[availableChains.length - 1] ? 0 : 1}
                >
                  <HStack space={3} alignItems="center">
                    <Box bg={getChainColor(chain)} {...chainIconStyles} width="6" height="6">
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
        <Pressable onPress={onSwap} {...swapButtonStyles}>
          <Text fontSize="xl" color="goodGrey.600" fontWeight="bold">
            ⇄
          </Text>
        </Pressable>

        {/* Target Chain */}
        <VStack {...chainContainerStyles}>
          <HStack space={3} alignItems="center">
            <Box bg={getChainColor(targetChain)} {...chainIconStyles}>
              <Text color="white" fontSize="sm" fontWeight="bold">
                {getChainIcon(targetChain)}
              </Text>
            </Box>
            <Pressable onPress={onTargetDropdownToggle} {...chainPressableStyles}>
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
            <Box {...dropdownStyles}>
              {validTargetChains.map(chain => {
                const isLastItem = chain === validTargetChains[validTargetChains.length - 1];

                return (
                  <Pressable
                    key={chain}
                    onPress={() => onTargetChainSelect(chain)}
                    {...dropdownItemStyles}
                    borderBottomWidth={isLastItem ? 0 : 1}
                  >
                    <HStack space={3} alignItems="center">
                      <Box bg={getChainColor(chain)} {...chainIconStyles} width="6" height="6">
                        <Text color="white" fontSize="xs" fontWeight="bold">
                          {getChainIcon(chain)}
                        </Text>
                      </Box>
                      <Text color="goodGrey.700" fontSize="md" fontWeight="500">
                        {getChainLabel(chain)}
                      </Text>
                    </HStack>
                  </Pressable>
                );
              })}
            </Box>
          )}
        </VStack>
      </HStack>
    );
  }
);
