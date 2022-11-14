import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useClaim } from "@gooddollar/web3sdk-v2";
import { View, IModalProps } from "native-base";

import { useQueryParam } from "../../hooks/useQueryParam";
import FvModal from "../modals/FVModal";
import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";
import ActionButton from "./ActionButton";
import FirstClaimModal from "../modals/FirstClaimModal";
import { useModalState } from "../../hooks/useModalState";

interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
  refresh?: "everyBlock" | "never" | number | undefined;
}

export type FVModalProps = IModalProps & FVFlowProps;

function ClaimButton({ firstName, method, refresh, ...props }: FVFlowProps) {
  const [showFVModal, openFVModal, closeFVModal] = useModalState();
  const [showClaimModal, openClaimModal, closeClaimModal] = useModalState();
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh);
  const isVerified = useQueryParam("verified");

  const handleClaim = useCallback(async () => {
    if (isWhitelisted || isVerified) {
      return await claimCall.send();
    }

    openFVModal();
  }, [isWhitelisted, openFVModal, claimCall]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted) {
      return "Verify Uniqueness";
    }

    if (claimAmount.toNumber() > 0) {
      return `Claim ${claimAmount}`;
    }

    return `Claim at: ${claimTime}`;
  }, [isWhitelisted, claimAmount, claimTime]);

  useEffect(() => {
    if (!isVerified || claimAmount.toNumber() <= 0) return;

    claimCall.send();
    openClaimModal();
  }, [isVerified, claimAmount, openClaimModal]);

  return (
    <View {...props}>
      <ActionButton text={buttonTitle} onPress={handleClaim} />

      <FvModal method={method} isOpen={showFVModal} onClose={closeFVModal} firstName={firstName} />
      <FirstClaimModal isOpen={showClaimModal} onClose={closeClaimModal} />
    </View>
  );
}

export const theme = {
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => ({
    justifyContent: "center",
    px: 4,
    minWidth: "100%",
    width: "100%"
  }))
};

export default withTheme()(ClaimButton);
