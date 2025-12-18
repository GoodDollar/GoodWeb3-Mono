import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";

import { MPBBridge } from "./MPBBridge";
import {
  useMPBBridge,
  useGetMPBBridgeData,
  useG$Decimals,
  SupportedChains,
  VALIDATION_REASONS
} from "@gooddollar/web3sdk-v2";
import { BridgeProvider } from "./types";

interface IMPBBridgeControllerProps {
  withHistory?: boolean;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}

export const MPBBridgeController: React.FC<IMPBBridgeControllerProps> = ({ onBridgeSuccess, onBridgeFailed }) => {
  const { chainId, account } = useEthers();
  const [bridgeProvider, setBridgeProvider] = useState<BridgeProvider>("layerzero");
  const { sendMPBBridgeRequest, bridgeRequestStatus, bridgeStatus } = useMPBBridge(bridgeProvider);

  const inputTransaction = useState<string>("0");
  const pendingTransaction = useState<any>(false);
  const [sourceChain, setSourceChain] = useState<string>(
    chainId && SupportedChains[chainId] ? SupportedChains[chainId].toLowerCase() : "celo"
  );

  // Update sourceChain when user switches chains
  useEffect(() => {
    if (chainId && SupportedChains[chainId]) {
      setSourceChain(SupportedChains[chainId].toLowerCase());
    }
  }, [chainId]);

  const bridgeData = useGetMPBBridgeData(sourceChain, "fuse", bridgeProvider, inputTransaction[0], account);
  const { bridgeFees, bridgeLimits, validation } = bridgeData;
  const protocolFeePercent = (bridgeData as any).protocolFeePercent as number | null;

  const fuseDecimals = useG$Decimals("G$", 122);
  const celoDecimals = useG$Decimals("G$", 42220);
  const mainnetDecimals = useG$Decimals("G$", 1);

  const scaleFrom18 = useCallback((value18?: ethers.BigNumber, targetDecimals?: number): ethers.BigNumber => {
    const value = value18 ?? ethers.BigNumber.from(0);
    const decimals = targetDecimals ?? 18;

    if (decimals === 18) {
      return value;
    }

    if (decimals < 18) {
      return value.div(ethers.BigNumber.from(10).pow(18 - decimals));
    }

    return value.mul(ethers.BigNumber.from(10).pow(decimals - 18));
  }, []);

  const limitsByChain = useMemo(() => {
    if (!bridgeLimits) {
      return undefined;
    }

    const toMinimum = (decimals?: number) => {
      const targetDecimals = decimals ?? 18;
      // Use the contract's actual minimum - no hardcoded override
      return scaleFrom18(bridgeLimits.minAmount, targetDecimals);
    };

    const buildLimits = (decimals?: number) => {
      const targetDecimals = decimals ?? 18;
      return {
        minAmount: toMinimum(targetDecimals),
        maxAmount: scaleFrom18(bridgeLimits.maxAmount, targetDecimals)
      };
    };

    // Only return limits for the current source chain
    // We can't assume limits are the same for all chains
    return {
      [sourceChain]: buildLimits(
        sourceChain === "fuse" ? fuseDecimals : sourceChain === "celo" ? celoDecimals : mainnetDecimals
      )
    };
  }, [bridgeLimits, fuseDecimals, celoDecimals, mainnetDecimals, scaleFrom18, sourceChain]);

  const useCanMPBBridge = useCallback(
    (chain: string, amountWei: string) => {
      // We rely on the validation from useGetMPBBridgeData which uses the current input
      // If the passed amount matches the current input, return the validation result
      if (amountWei === inputTransaction[0]) {
        if (!validation.isValid) {
          return { isValid: false, reason: validation.reason, errorMessage: validation.errorMessage };
        }
        if (!validation.canBridge) {
          return { isValid: false, reason: VALIDATION_REASONS.CANNOT_BRIDGE };
        }
        return { isValid: true, reason: "" };
      }

      // Fallback for when amount doesn't match (shouldn't happen often in current UI flow)
      // We can't validate accurately without calling the hook with new amount
      return { isValid: true, reason: "" };
    },
    [validation, inputTransaction]
  );

  const onBridgeStartHandler = useCallback(
    async (sourceChain: string, targetChain: string) => {
      const [inputWei] = inputTransaction;

      try {
        await sendMPBBridgeRequest(inputWei, sourceChain, targetChain, account);
      } catch (e: any) {
        console.error("Bridge start error:", e);
      }
    },
    [inputTransaction, sendMPBBridgeRequest]
  );

  useEffect(() => {
    if (bridgeRequestStatus?.status === "Exception") {
      // The error is now handled in the bridge hook and propagated through bridgeStatus
      console.error("Bridge transaction exception:", bridgeRequestStatus.errorMessage);
    }
  }, [bridgeRequestStatus]);

  const effectiveFees = bridgeFees || { nativeFee: ethers.BigNumber.from(0), zroFee: ethers.BigNumber.from(0) };

  return (
    <VStack space={4} width="100%">
      <MPBBridge
        useCanMPBBridge={useCanMPBBridge}
        originChain={[sourceChain, setSourceChain]}
        inputTransaction={inputTransaction}
        pendingTransaction={pendingTransaction}
        protocolFeePercent={protocolFeePercent || 0}
        limits={limitsByChain}
        fees={{
          fuse: {
            nativeFee: effectiveFees.nativeFee || ethers.BigNumber.from(0),
            zroFee: effectiveFees.zroFee || ethers.BigNumber.from(0)
          },
          celo: {
            nativeFee: effectiveFees.nativeFee || ethers.BigNumber.from(0),
            zroFee: effectiveFees.zroFee || ethers.BigNumber.from(0)
          },
          mainnet: {
            nativeFee: effectiveFees.nativeFee || ethers.BigNumber.from(0),
            zroFee: effectiveFees.zroFee || ethers.BigNumber.from(0)
          }
        }}
        bridgeStatus={bridgeStatus}
        onBridgeStart={onBridgeStartHandler}
        onBridgeFailed={onBridgeFailed}
        onBridgeSuccess={onBridgeSuccess}
        bridgeProvider={bridgeProvider}
        onBridgeProviderChange={setBridgeProvider}
      />
    </VStack>
  );
};
