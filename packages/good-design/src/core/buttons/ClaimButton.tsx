import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useClaim } from "@gooddollar/web3sdk-v2";
import { View, IModalProps } from "native-base";
import { ButtonAction } from "./ActionButton";
import { useQueryParam } from "../../hooks";
import { ClaimButtonStyles } from "./ClaimButton.theme";
import { withTheme } from "../../theme/hoc/withTheme";
import FvModalWithTheme from "../modals/FVModal";

interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
  refresh?: "everyBlock" | "never" | number | undefined;
}

export type FVModalProps = IModalProps & FVFlowProps;

export function ClaimButton({ firstName, method, styles, refresh }: FVFlowProps) {
  const [showModal, setShowModal] = useState(false);
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh);
  const { status: claimStatus } = claimCall?.state || {};
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

  // this useEffect doesn't make sense. If is whiteListed is undefined on initial load it will never refresh the useCall in useClaim
  // useEffect(() => {
  //   setRefresh(!isWhitelisted || ["Mining", "PendingSignature"].includes(claimStatus));
  // }, [isWhitelisted, claimStatus]);

  useEffect(() => {
    console.log("isVerified :", isVerified);
  }, [isVerified]);

  return (
    <View style={styles.wrapper}>
      <View flex={1} alignItems="center" justifyContent="center">
        <FvModalWithTheme method={method} isOpen={showModal} onClose={handleClose} firstName={firstName} />
      </View>
      <ButtonAction text={buttonTitle} onPress={handleClaim} />
    </View>
  );
}

const ClaimButtonWithTheme = withTheme(ClaimButtonStyles)(ClaimButton);
export default ClaimButtonWithTheme;
