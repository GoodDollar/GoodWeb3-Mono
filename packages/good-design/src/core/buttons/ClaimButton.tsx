import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useClaim } from "@gooddollar/web3sdk-v2";
import { View } from "native-base";

import { useQueryParam } from "../../hooks";
import FvModal from "../modals/FVModal";
import { withTheme } from "../../theme/hoc/withTheme";
import ActionButton from "./ActionButton";

interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
  refresh?: "everyBlock" | "never" | number | undefined;
}

function ClaimButton({ firstName, method, refresh, ...props }: FVFlowProps) {
  const [showModal, setShowModal] = useState(false);
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh);
  const isVerified = useQueryParam("verified");
  const handleClose = useCallback(() => setShowModal(false), [setShowModal]);

  const handleClaim = useCallback(async () => {
    if (isWhitelisted || isVerified) {
      return await claimCall.send();
    }

    setShowModal(true);
  }, [isWhitelisted, setShowModal, claimCall]);

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
    console.log("isVerified :", isVerified);
  }, [isVerified]);

  return (
    <View {...props}>
      <View flex={1} alignItems="center" justifyContent="center">
        <FvModal method={method} isOpen={showModal} onClose={handleClose} firstName={firstName} />
      </View>
      <ActionButton text={buttonTitle} onPress={handleClaim} />
    </View>
  );
}

export const theme = {
  baseStyle: {
    width: "100%"
  }
}

export default withTheme()(ClaimButton);
