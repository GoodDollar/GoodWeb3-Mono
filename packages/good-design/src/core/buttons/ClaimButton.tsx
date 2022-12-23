import React, { useEffect, useCallback, useMemo, useState } from "react";
import { SupportedChains, useClaim } from "@gooddollar/web3sdk-v2";
import { Text, View, Spinner, useColorModeValue } from "native-base";

import { useQueryParam } from "../../hooks/useQueryParam";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import ActionButton from "./ActionButton";
import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import { FVFlowProps } from "./types";
import { noop } from "lodash";
import { Image } from "../images";
import ClaimImage from "../../assets/images/claim.png";
import { BasicModalProps } from "../modals/BasicModal";

const ClaimButton = ({ firstName, method, refresh, claimed, claim, ...props }: FVFlowProps) => {
  const { Modal: FirstClaimModal, showModal: showFirstClaimModal } = useModal();
  const { Modal: ActionModal, showModal: showActionModal, hideModal: hideActionModal } = useModal();
  const { Modal: FVModal, showModal: showFVModal, hideModal: hideFVModal } = useModal();
  const { loading, verify } = useFVModalAction({ firstName, method, onClose: hideFVModal });
  const { isWhitelisted, claimAmount } = useClaim(refresh);
  const [firstClaim, setFirstClaim] = useState(false);
  const isVerified = useQueryParam("verified", true);
  const textColor = useColorModeValue("paragraph", "white");

  const claimModalProps: Omit<BasicModalProps, "modalVisible"> = useMemo(
    () =>
      firstClaim
        ? {
            header: (
              <>
                <Title mb="2">Your first claim is ready!</Title>
                <Text color={textColor} fontSize="md">
                  To complete it, sign in your wallet
                </Text>
              </>
            ),
            // body: <Image source={ClaimImage} w="full" h="auto" />,
            body: <></>,
            closeText: "",
            hasTopBorder: false,
            hasBottomBorder: false
          }
        : {
            header: (
              <>
                <Title mb="2">Action Required</Title>
                <Text color={textColor} fontSize="md">
                  To complete this action, sign in your wallet.
                </Text>
              </>
            ),
            body: (
              <>
                <Text color={textColor} fontSize="sm" fontWeight="medium">
                  Watch this video to learn more about signing transactions.
                </Text>
                <Image source={ClaimImage} w="full" h="auto" />
              </>
            ),
            closeText: "",
            hasBottomBorder: false
          },
    [firstClaim, textColor]
  );

  const handleClaimCall = useCallback(
    async (first = false) => {
      setFirstClaim(first);
      showActionModal();

      try {
        const success = await claim();
        if (success !== true || first === false) return;

        showFirstClaimModal();
      } finally {
        hideActionModal();
      }
    },
    [claim, hideActionModal, showFirstClaimModal]
  );

  const handleClaim = useCallback(async () => {
    if (isWhitelisted) {
      await handleClaimCall();
      return;
    }

    showFVModal();
  }, [isWhitelisted, handleClaimCall, showFVModal]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted) {
      return "VERIFY UNIQUENESS";
    }

    return "CLAIM NOW";
  }, [isWhitelisted]);

  useEffect(() => {
    if (isVerified !== true || claimed || isWhitelisted === false || claimAmount.toNumber() <= 0) {
      return;
    }

    handleClaimCall(true).catch(noop);
  }, [isVerified, claimed, isWhitelisted, claimAmount, handleClaimCall]);

  if (isWhitelisted && claimed) {
    return (
      <FirstClaimModal
        header={
          <>
            <Title mb="2">Yay! You've made your first claim.</Title>
            <Text color={textColor}>Check out how you can use your GoodDollars:</Text>
          </>
        }
        body={<Image source={ClaimImage} w="full" h="auto" />}
        closeText=""
        hasTopBorder={false}
        hasBottomBorder={false}
      />
    );
  }

  return (
    <View flex={1} w="full" {...props}>
      <View w="full" alignItems="center" pt="12" pb="12">
        <Web3ActionButton
          text={buttonTitle}
          requiredChain={SupportedChains.FUSE}
          web3Action={handleClaim}
          w="56"
          h="56"
          px="2.5"
          borderRadius="50%"
          bg="buttonBackground"
          disabled={claimed}
          innerText={{style: {fontWeight: "bold"}, fontFamily: "body"}}
        />
      </View>

      <FVModal
        header={<Title>Verify Uniqueness</Title>}
        body={
          <>
            <Text color={textColor} mb="2">
              To verify your identity you need to sign TWICE with your wallet.
            </Text>
            <Text color={textColor} mb="2">
              First sign your address to be whitelisted
            </Text>
            <Text color={textColor} mb="2">
              Second sign your self sovereign anonymized identifier, so no link is kept between your identity record and
              your address.
            </Text>
          </>
        }
        footer={
          loading ? (
            <Spinner />
          ) : (
            <View justifyContent="space-between" width="full" flexDirection="row">
              <ActionButton text={"Verify Uniqueness"} onPress={verify} bg="main" />
            </View>
          )
        }
        closeText=""
        hasTopBorder={false}
        hasBottomBorder={false}
      />
      <ActionModal {...claimModalProps} />
    </View>
  );
};

export default ClaimButton;
