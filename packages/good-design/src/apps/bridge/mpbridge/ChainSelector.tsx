import React, { memo, useMemo } from "react";
import { Box, HStack, Pressable, ChevronDownIcon, Text, VStack } from "native-base";
import { Image, SvgXml } from "../../../core/images";
import { getBridgeNetworkIcon } from "../../../utils/icons";
import { getChainColor, getChainLabel, getValidTargetChains } from "./utils";

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

const chainIconImageStyles = {
  borderRadius: "full",
  width: "8",
  height: "8"
} as const;

const dropdownChainIconImageStyles = {
  borderRadius: "full",
  width: "6",
  height: "6"
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
        <VStack {...chainContainerStyles}>
          <HStack space={3} alignItems="center">
            {getBridgeNetworkIcon(sourceChain) ? (
              <Box
                key={sourceChain}
                overflow="hidden"
                {...chainIconImageStyles}
                borderWidth="1"
                borderColor="goodGrey.200"
              >
                {sourceChain === "celo" ? (
                  <SvgXml key={sourceChain} src={getBridgeNetworkIcon(sourceChain)} width={32} height={32} />
                ) : (
                  <Image key={sourceChain} source={getBridgeNetworkIcon(sourceChain)} w="8" h="8" resizeMode="cover" />
                )}
              </Box>
            ) : (
              <Box bg={getChainColor(sourceChain)} {...chainIconStyles}>
                <Text color="white" fontSize="sm" fontWeight="bold">
                  {sourceChain.charAt(0).toUpperCase()}
                </Text>
              </Box>
            )}
            <Pressable onPress={onSourceDropdownToggle} {...chainPressableStyles}>
              <Text color="goodGrey.700" fontSize="md" fontWeight="600">
                {getChainLabel(sourceChain)}
              </Text>
              <Box style={{ transform: [{ rotate: showSourceDropdown ? "180deg" : "0deg" }] }}>
                <ChevronDownIcon size="sm" color="goodGrey.400" />
              </Box>
            </Pressable>
          </HStack>

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
                    {getBridgeNetworkIcon(chain) ? (
                      <Box
                        overflow="hidden"
                        {...dropdownChainIconImageStyles}
                        borderWidth="1"
                        borderColor="goodGrey.200"
                      >
                        {chain === "celo" ? (
                          <SvgXml src={getBridgeNetworkIcon(chain)} width={24} height={24} />
                        ) : (
                          <Image source={getBridgeNetworkIcon(chain)} w="6" h="6" resizeMode="cover" />
                        )}
                      </Box>
                    ) : (
                      <Box bg={getChainColor(chain)} {...chainIconStyles} width="6" height="6">
                        <Text color="white" fontSize="xs" fontWeight="bold">
                          {chain.charAt(0).toUpperCase()}
                        </Text>
                      </Box>
                    )}
                    <Text color="goodGrey.700" fontSize="md" fontWeight="500">
                      {getChainLabel(chain)}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </Box>
          )}
        </VStack>

        <Pressable onPress={onSwap} {...swapButtonStyles}>
          <Text fontSize="xl" color="goodGrey.600" fontWeight="bold">
            ⇄
          </Text>
        </Pressable>

        <VStack {...chainContainerStyles}>
          <HStack space={3} alignItems="center">
            {getBridgeNetworkIcon(targetChain) ? (
              <Box
                key={targetChain}
                overflow="hidden"
                {...chainIconImageStyles}
                borderWidth="1"
                borderColor="goodGrey.200"
              >
                {targetChain === "celo" ? (
                  <SvgXml key={targetChain} src={getBridgeNetworkIcon(targetChain)} width={32} height={32} />
                ) : (
                  <Image key={targetChain} source={getBridgeNetworkIcon(targetChain)} w="8" h="8" resizeMode="cover" />
                )}
              </Box>
            ) : (
              <Box bg={getChainColor(targetChain)} {...chainIconStyles}>
                <Text color="white" fontSize="sm" fontWeight="bold">
                  {targetChain.charAt(0).toUpperCase()}
                </Text>
              </Box>
            )}
            <Pressable onPress={onTargetDropdownToggle} {...chainPressableStyles}>
              <Text color="goodGrey.700" fontSize="md" fontWeight="600">
                {getChainLabel(targetChain)}
              </Text>
              <Box style={{ transform: [{ rotate: showTargetDropdown ? "180deg" : "0deg" }] }}>
                <ChevronDownIcon size="sm" color="goodGrey.400" />
              </Box>
            </Pressable>
          </HStack>

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
                      {getBridgeNetworkIcon(chain) ? (
                        <Box
                          overflow="hidden"
                          {...dropdownChainIconImageStyles}
                          borderWidth="1"
                          borderColor="goodGrey.200"
                        >
                          {chain === "celo" ? (
                            <SvgXml src={getBridgeNetworkIcon(chain)} width={24} height={24} />
                          ) : (
                            <Image source={getBridgeNetworkIcon(chain)} w="6" h="6" resizeMode="cover" />
                          )}
                        </Box>
                      ) : (
                        <Box bg={getChainColor(chain)} {...chainIconStyles} width="6" height="6">
                          <Text color="white" fontSize="xs" fontWeight="bold">
                            {chain.charAt(0).toUpperCase()}
                          </Text>
                        </Box>
                      )}
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
