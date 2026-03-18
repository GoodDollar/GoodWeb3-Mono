import { useCallback, useEffect, useMemo, useState } from "react";
import { BridgeProvider } from "../constants";
import { useGetMPBBridgeData } from "../hooks/useGetMPBBridgeData";
import { useMPBBridge } from "../hooks/useMPBBridge";
import { deriveMPBBridgeFlowState } from "./bridgeFlowState";
import { MPBBridgeFlowTxHashes, UseMPBBridgeFlowParams } from "./types";

const areTxHashesEqual = (left: MPBBridgeFlowTxHashes, right: MPBBridgeFlowTxHashes) => {
  return left.approve === right.approve && left.bridgeTo === right.bridgeTo && left.final === right.final;
};

export const useMPBBridgeFlow = ({
  bridgeProvider = "axelar",
  sourceChain,
  targetChain,
  amountWei = "0",
  account,
  canSubmit,
  hasFeeError
}: UseMPBBridgeFlowParams = {}) => {
  const [txHashes, setTxHashes] = useState<MPBBridgeFlowTxHashes>({});

  const bridge = useMPBBridge(bridgeProvider as BridgeProvider);
  const bridgeData = useGetMPBBridgeData(
    sourceChain,
    targetChain,
    bridgeProvider as BridgeProvider,
    amountWei,
    account
  );

  const flow = useMemo(() => {
    const canSubmitFromValidation = bridgeData.validation.isValid && bridgeData.validation.canBridge;

    return deriveMPBBridgeFlowState({
      bridgeStatus: bridge.bridgeStatus,
      isSwitchingChain: bridge.isSwitchingChain,
      previousTxHashes: txHashes,
      canSubmit: canSubmit ?? canSubmitFromValidation,
      hasFeeError: hasFeeError ?? Boolean(bridgeData.error)
    });
  }, [
    bridge.bridgeStatus,
    bridge.isSwitchingChain,
    bridgeData.validation,
    bridgeData.error,
    txHashes,
    canSubmit,
    hasFeeError
  ]);

  useEffect(() => {
    setTxHashes(prev => {
      if (areTxHashesEqual(prev, flow.currentTxHashes)) {
        return prev;
      }

      return flow.currentTxHashes;
    });
  }, [flow.currentTxHashes]);

  const resetFlow = useCallback(() => {
    setTxHashes({});
  }, []);

  return {
    ...bridge,
    flow,
    bridgeData,
    resetFlow
  };
};
