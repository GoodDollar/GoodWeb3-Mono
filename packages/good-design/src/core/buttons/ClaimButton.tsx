import React, { useEffect, useCallback, useMemo, useState } from "react";
import { AsyncStorage, SupportedChains, useClaim } from "@gooddollar/web3sdk-v2";
import { Text, View, IModalProps, Spinner } from "native-base";

import { useQueryParam } from "../../hooks/useQueryParam";
import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import ActionButton from "./ActionButton";
import { useModal } from "../../hooks/useModal";
import { noop } from "lodash";

export interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
  styles?: any;
  refresh?: "everyBlock" | "never" | number | undefined;
}

export type FVModalProps = IModalProps & FVFlowProps;

const ClaimButton = withTheme({ name: "ClaimButton" })(({ firstName, method, refresh, ...props }: FVFlowProps) => {
  const { Modal: FirstClaimModal, showModal: showFirstClaimModal, hideModal: hideFirstClaimModal } = useModal();
  const { Modal: FVModal, showModal: showFVModal, hideModal: hideFVModal } = useModal();
  const { loading, verify } = useFVModalAction({ firstName, method, onClose: hideFVModal });
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh);
  const isVerified = useQueryParam("verified");
  const [claimInProcess, setClaimInProcess] = useState(false);

  const handleClaimCall = useCallback(
    async (first = false) => {
      if (claimInProcess === true) return;

      if (first === true) {
        showFirstClaimModal();
      }

      setClaimInProcess(true);
      await claimCall.send().finally(() => {
        setClaimInProcess(false);
        hideFirstClaimModal();
      });
    },
    [claimCall, showFirstClaimModal, hideFirstClaimModal, setClaimInProcess]
  );

  const handleClaim = useCallback(async () => {
    if (isWhitelisted || isVerified) {
      handleClaimCall().catch(noop);
      return;
    }

    showFVModal();
  }, [isWhitelisted, handleClaimCall, showFVModal]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted) {
      return "Verify Uniqueness";
    }

    if (claimAmount.toNumber() > 0) {
      return `Claim ${claimAmount}`;
    }

    return `Claim at: ${claimTime}`;
  }, [isWhitelisted, claimAmount, claimTime]);

  const claimButtonDisabled = useMemo(
    () => claimAmount.toNumber() <= 0 || claimInProcess === true,
    [claimAmount, claimInProcess]
  );

  useEffect(() => {
    const onFirstClaim = async () => {
      const claimedBefore = await AsyncStorage.getItem("claimed_gd");
      if (claimedBefore === true) return;

      await AsyncStorage.setItem("claimed_gd", true);
      await handleClaimCall(true);
    };

    if (!isVerified || claimAmount.toNumber() <= 0) return;

    onFirstClaim().catch(noop);
  }, [isVerified, claimAmount, handleClaimCall]);

  return (
    <View justifyContent="center" px={4} {...props}>
      <Web3ActionButton
        text={buttonTitle}
        requiredChain={SupportedChains.FUSE}
        web3Action={handleClaim}
        disabled={claimButtonDisabled}
      />
      <FVModal
        body={
          <>
            <Text color="text1">To verify your identity you need to sign TWICE with your wallet.</Text>
            <Text color="text1">First sign your address to be whitelisted</Text>
            <Text color="text1">
              Second sign your self sovereign anonymized identifier, so no link is kept between your identity record and
              your address.
            </Text>
          </>
        }
        footer={
          loading ? (
            <Spinner />
          ) : (
            <View justifyContent="space-between" width="100%" flexDirection="row">
              <ActionButton text={"Verify Uniqueness"} onPress={verify} />
            </View>
          )
        }
      />
      <FirstClaimModal
        header={
          <Text color="text1" fontWeight="bold">
            Your first claim is ready!
          </Text>
        }
        body={<Text color="text1">To complete it, sign in your wallet</Text>}
      />
    </View>
  );
});

export const theme = {
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => ({
    bg: colorModeValue("coolGray.50", "coolGray.900")
  }))
};

export default ClaimButton;
