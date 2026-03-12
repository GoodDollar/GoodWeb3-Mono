import React from "react";
import { VStack } from "native-base";

import { MPBBridge } from "./MPBBridge";
import { useMPBBridgeFeatureController } from "./feature/useMPBBridgeFeatureController";

interface IMPBBridgeControllerProps {
  withHistory?: boolean;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}

export const MPBBridgeController: React.FC<IMPBBridgeControllerProps> = ({
  onBridgeStart,
  onBridgeSuccess,
  onBridgeFailed
}) => {
  const bridgeProps = useMPBBridgeFeatureController({
    onBridgeStart,
    onBridgeSuccess,
    onBridgeFailed
  });

  return (
    <VStack space={4} width="100%">
      <MPBBridge {...bridgeProps} />
    </VStack>
  );
};
