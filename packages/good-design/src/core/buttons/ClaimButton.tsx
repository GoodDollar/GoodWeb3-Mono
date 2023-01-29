import React, { useEffect, useCallback, useMemo, useState } from "react";
import { SupportedChains, useClaim, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { Text, View, useColorModeValue, Box, Spinner } from "native-base";

import { useQueryParam } from "../../hooks/useQueryParam";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import ActionButton from "./ActionButton";
import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import { FVFlowProps } from "./types";
import { Image } from "../images";
import ClaimImage from "../../assets/images/claim.png";
import { BasicModalProps } from "../modals/BasicModal";

const ClaimButton = ({ firstName, method, refresh, claimed, claim, ...props }: FVFlowProps) => {
  const { Modal: FirstClaimModal, showModal: showFirstClaimModal } = useModal();
  const { Modal: ActionModal, showModal: showActionModal, hideModal: hideActionModal } = useModal();
  const { loading, handleFvFlow, verifying } = useFVModalAction({
    firstName,
    method,
    onClose: () => {
      if (!verifying) {
        hideActionModal();
      }
    }
  });
  const { isWhitelisted, claimAmount } = useClaim(refresh);
  const [firstClaim, setFirstClaim] = useState(false);
  const isVerified = useQueryParam("verified", true);
  const textColor = useColorModeValue("goodGrey.500", "white");
  const { chainId } = useGetEnvChainId();
  const [requiredChain, setRequiredChain] = useState(SupportedChains.CELO);

  useEffect(() => {
    switch (chainId) {
      case 122:
        setRequiredChain(SupportedChains.FUSE);
        break;
      default:
        setRequiredChain(SupportedChains.CELO);
        break;
    }
  }, [chainId]);

  // todo, add loading body
  const actionModalBody = useMemo(
    () => ({
      verify: {
        body: (
          <>
            {" "}
            {/* TODO: Await confirmation for copy */}
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
        ),
        footer: (
          <View justifyContent="space-between" width="full" flexDirection="row">
            <ActionButton color="white" text={"Verify Uniqueness"} onPress={handleFvFlow} bg="main" />
          </View>
        )
      },
      confirm: (
        <Box mb="24px" mt="16px">
          <Title fontFamily="subheading" fontWeight="normal" fontSize="sm">
            WATCH
          </Title>
          <Text fontFamily="mono" color="primary" mb="8px" fontSize="l" fontWeight="bold">
            What are gas-fees?
          </Text>
          <Image source={ClaimImage} w="full" h="auto" />
        </Box>
      )
    }),
    [handleFvFlow]
  );

  const claimModalProps: Omit<BasicModalProps, "modalVisible"> = useMemo(
    () =>
      firstClaim
        ? {
            header: (
              <>
                <Title fontSize="xl" mb="2">
                  Your first claim is ready!
                </Title>
                <Text color={textColor} fontSize="md">
                  To complete it, sign in your wallet
                </Text>
              </>
            ),
            body: <></>,
            closeText: "",
            hasTopBorder: false,
            hasBottomBorder: false
          }
        : {
            header: (
              <>
                <Title fontSize="xl" mb="2" fontWeight="bold" lineHeight="36px">
                  Action Required
                </Title>
                <Text color={textColor} fontFamily="subheading" fontWeight="normal" fontSize="md">
                  To complete this action, continue in your wallet.
                </Text>
              </>
            ),
            body: loading ? (
              <Spinner color="emerald.500" />
            ) : isWhitelisted ? (
              actionModalBody.confirm
            ) : (
              actionModalBody.verify.body
            ),
            footer: isWhitelisted || loading ? undefined : actionModalBody.verify.footer,
            closeText: "",
            hasBottomBorder: false
          },
    [firstClaim, textColor, loading, isWhitelisted]
  );

  const handleClaim = async (first: boolean) => {
    try {
      const success = await claim();
      if (success !== true || first === false) return;

      showFirstClaimModal();
    } finally {
      hideActionModal();
    }
  };

  const handleVerify = async () => {
    try {
      const interval = setInterval(async () => {
        if (!verifying) {
          await handleClaim(true);
        }
      }, 5000);

      setTimeout(() => {
        clearInterval(interval);
        hideActionModal();
      }, 50000);
    } catch (e: any) {
      console.log("verifying cancelled or failed ->", { e });
    }
  };

  const handleModalOpen = useCallback(
    async (first = false) => {
      console.log("handle modal open", { isWhitelisted });
      setFirstClaim(first);
      showActionModal();
      if (isWhitelisted) {
        await handleClaim(first);
      } else {
        await handleVerify();
      }
    },
    [claim, hideActionModal, showFirstClaimModal, isWhitelisted]
  );

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted) {
      return "CLAIM NOW";
    }

    // todo: add amount when connect, use formatted token amount with G$Amount
    return "CLAIM NOW " + claimAmount;
  }, [isWhitelisted]);

  useEffect(() => {
    if (isVerified !== true || claimed || isWhitelisted === false || claimAmount.toNumber() <= 0) {
      return;
    }
  }, [isVerified, claimed, isWhitelisted, claimAmount]);
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
      <View w="full" alignItems="center" pt="8" pb="8">
        <Web3ActionButton
          text={buttonTitle}
          web3Action={handleModalOpen}
          disabled={claimed}
          variant="round"
          requiredChain={requiredChain}
        />
        <Text variant="shadowed" />
      </View>
      <ActionModal {...claimModalProps} />
    </View>
  );
};

export default ClaimButton;
