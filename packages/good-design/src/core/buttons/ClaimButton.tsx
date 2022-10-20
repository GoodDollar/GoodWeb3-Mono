import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useClaim } from "@gooddollar/web3sdk-v2";
import { View, IModalProps } from "native-base";
import { ButtonAction } from "./ActionButton";
import { useQueryParam } from "../../hooks";
import { styles } from "./ClaimButton.theme";
import { withTheme } from "../../theme/hoc/withTheme";
import { FVModal } from "../modals/FVModal";


interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
}

export type FVModalProps = IModalProps & FVFlowProps;

export function ClaimButton({ firstName, method, styles }: FVFlowProps) {
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh ? "everyBlock" : "never");
  const { status: claimStatus } = claimCall?.state || {};
  const isVerified = useQueryParam('verified')
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
    setRefresh(!isWhitelisted || ["Mining", "PendingSignature"].includes(claimStatus));
  }, [isWhitelisted, claimStatus]);

  useEffect(() => {
    console.log('isVerified :', isVerified)
  }, [isVerified])

  return (
    <View style={styles.wrapper}>
      <View flex={1} alignItems="center" justifyContent="center">
        <FVModal method={method} isOpen={showModal} onClose={handleClose} firstName={firstName} />
      </View>
      <ButtonAction text={buttonTitle} onPress={handleClaim} />
    </View>
  );
}

export default withTheme(styles)(ClaimButton);
