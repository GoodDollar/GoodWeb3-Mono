import React, { useEffect, useCallback, useMemo, useState } from "react";
import { AsyncStorage, SupportedChains, useClaim } from "@gooddollar/web3sdk-v2";
import { Text, View, Spinner } from "native-base";
import { noop } from "lodash";

import { useQueryParam } from "../../hooks/useQueryParam";
import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import ActionButton from "./ActionButton";
import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import { FVFlowProps } from "./types";

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
      await handleClaimCall();
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

      // what if users cancels claim?
      await AsyncStorage.setItem("claimed_gd", true);
      await handleClaimCall(true);
    };

    if (!isVerified || claimAmount.toNumber() <= 0) return;

    onFirstClaim().catch(noop);
  }, [isVerified, claimAmount, handleClaimCall]);

  return (
    <View flex={1} w="full" {...props}>
      <View w="full" alignItems="center" pt="46px" pb="90px">
        <Web3ActionButton
          text={buttonTitle}
          requiredChain={SupportedChains.FUSE}
          web3Action={handleClaim}
          disabled={claimButtonDisabled}
          w="200px"
          h="200px"
          px="10px"
          borderRadius="50%"
          bg="buttonBackground"
          innerText={{
            fontSize: "20px",
            fontWeight: "700",
            color: "white"
          }}
          innerIndicatorText={{
            color: "white",
            fontSize: "14px"
          }}
        />
      </View>

      <FVModal
        header={<Title>Verify Uniqueness</Title>}
        body={
          <>
            <Text color={"paragraph"} mb="8px">
              To verify your identity you need to sign TWICE with your wallet.
            </Text>
            <Text color={"paragraph"} mb="8px">
              First sign your address to be whitelisted
            </Text>
            <Text color={"paragraph"} mb="8px">
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
              <ActionButton text={"Verify Uniqueness"} onPress={verify} bg="main" />
            </View>
          )
        }
        closeText=""
      />
      <FirstClaimModal
        header={<Title>Your first claim is ready!</Title>}
        body={<Text color={"paragraph"}>To complete it, sign in your wallet</Text>}
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
