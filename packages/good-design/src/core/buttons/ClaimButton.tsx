import React, { useEffect, useCallback, useMemo } from "react";
import { SupportedChains, useClaim } from "@gooddollar/web3sdk-v2";
import { Text, View, Spinner, useColorModeValue } from "native-base";

import { useQueryParam } from "../../hooks/useQueryParam";
import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import ActionButton from "./ActionButton";
import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import { FVFlowProps } from "./types";

const ClaimButton = withTheme()(({ firstName, method, refresh, claim, ...props }: FVFlowProps) => {
  const { Modal: FirstClaimModal, showModal: showFirstClaimModal } = useModal();
  const { Modal: FVModal, showModal: showFVModal, hideModal: hideFVModal } = useModal();
  const { loading, verify } = useFVModalAction({ firstName, method, onClose: hideFVModal });
  const { isWhitelisted, claimAmount } = useClaim(refresh);
  const isVerified = useQueryParam("verified");
  const textColor = useColorModeValue("text1", "white");

  const handleClaim = useCallback(async () => {
    if (isWhitelisted || isVerified) {
      await claim();
      return;
    }

    showFVModal();
  }, [isWhitelisted, showFVModal, claim]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted) {
      return "Verify Uniqueness";
    }

    return `CLAIM NOW`;
  }, [isWhitelisted]);

  useEffect(() => {
    if (!isVerified || claimAmount.toNumber() <= 0) return;

    claim();
    showFirstClaimModal();
  }, [isVerified, claimAmount, showFirstClaimModal]);

  if (isWhitelisted && claimAmount.toNumber() <= 0) return null;

  return (
    <View flex={1} w="full" {...props}>
      <View w="full" alignItems="center" pt="46px" pb="90px">
        <Web3ActionButton
          text={buttonTitle}
          requiredChain={SupportedChains.FUSE}
          web3Action={handleClaim}
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
            <Text color={textColor} mb="8px">
              To verify your identity you need to sign TWICE with your wallet.
            </Text>
            <Text color={textColor} mb="8px">
              First sign your address to be whitelisted
            </Text>
            <Text color={textColor} mb="8px">
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
        body={<Text color={textColor}>To complete it, sign in your wallet</Text>}
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
