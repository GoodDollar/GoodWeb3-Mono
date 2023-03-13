import React, { useEffect, useCallback, useMemo, useState } from "react";
import { SupportedChains, useClaim, useGetEnvChainId, useWhitelistSync, G$Amount } from "@gooddollar/web3sdk-v2";
import { Text, View, useColorModeValue, Box, Link, HStack } from "native-base";
import { useQueryParam } from "../../hooks/useQueryParam";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import { FVFlowProps } from "./types";
import { Image } from "../images";
import FirstClaimYay from "../../assets/images/yay.png";
import SocialShare from "../../assets/images/social_share.png";
import { BasicModalProps } from "../modals/BasicModal";
import { noop, isNil } from "lodash";
import { useEthers } from "@usedapp/core";
import ArrowButton from "./ArrowButton";
import BackToSchool from "../../assets/images/backtoschool.png";
import TwitterIcon from "../../assets/svg/twitter.svg";
import LinkedInIcon from "../../assets/svg/linkedin.svg";
import FbIcon from "../../assets/svg/facebook.svg";
import SocialsLink from "./SocialLink";
import BasePressable from "./BasePressable";
import { openLink } from "@gooddollar/web3sdk-v2";

const ClaimButton = ({
  firstName,
  method,
  refresh,
  claimed,
  claiming,
  claim,
  chainId,
  handleConnect,
  onEvent,
  redirectUrl,
  ...props
}: FVFlowProps) => {
  const { account } = useEthers();
  const { Modal: FinalizationModal, showModal: showFinalizationModal } = useModal();
  const { Modal: ActionModal, showModal: showActionModal, hideModal: hideActionModal } = useModal();
  const [claimLoading, setClaimLoading] = useState(false);
  const [whitelistLoading, setWhitelistLoading] = useState(false);

  const { loading, verify } = useFVModalAction({
    firstName,
    method,
    chainId,
    onClose: hideActionModal,
    redirectUrl
  });

  const { isWhitelisted, claimAmount } = useClaim(refresh);
  const [firstClaim, setFirstClaim] = useState(false);
  const isVerified = useQueryParam("verified", true);
  const textColor = useColorModeValue("goodGrey.500", "white");
  const { chainId: defaultChainId, defaultEnv } = useGetEnvChainId();
  const { fuseWhitelisted, syncStatus } = useWhitelistSync();

  const openSigningTab = useCallback(async () => {
    const link = "https://www.notion.so/gooddollar/What-is-signing-b0019fe6c43241068050c9aa16e87ee1";
    await openLink(link, "_blank");
  }, []);

  const actionModalBody = useMemo(
    () => ({
      verify: {
        header: (
          <>
            <Title fontSize="xl" mb="2" lineHeight="43px">
              Verify Uniqueness
            </Title>
            <Text color={textColor} fontSize="sm" fontFamily="subheading">
              You're almost there! To claim G$, you need to be a unique human and prove it wiht your camera.
            </Text>
            <Link
              _text={{ color: "main" }}
              mt="10"
              href="https://www.notion.so/gooddollar/Get-G-873391f31aee4a18ab5ad7fb7467acb3"
            >
              Learn more about the identification process.
            </Link>
          </>
        ),
        body:
          loading || claimLoading ? (
            <BasePressable
              innerView={{
                w: "300",
                h: "130px",
                bgColor: "goodWhite.100",
                display: "flex",
                flexDir: "row",
                alignItems: "center",
                justifyContent: "center",
                style: { flexGrow: 1 }
              }}
              onPress={openSigningTab}
            >
              <Box display="flex" w="60%" alignSelf="flex-start" p={2}>
                <Text color="lightBlue" fontSize="sm">
                  LEARN
                </Text>
                <Text
                  color="main"
                  lineHeight="normal"
                  fontSize="sm"
                  fontWeight="normal"
                  fontFamily="subheading"
                  textDecoration
                >
                  {claiming ? `How do transactions work? >` : `What is signing? >`}
                </Text>
              </Box>
              <Box>
                <Image source={BackToSchool} w="92px" h="111px" margin-right="0" style={{ resizeMode: "contain" }} />
              </Box>
            </BasePressable>
          ) : (
            <>
              <Text color={textColor} mb="2" fontFamily="subheading" fontSize="sm">
                Verifying your identity is easy. You'll be asked to sign with your wallet.
              </Text>
              <Text color={textColor} mb="2" fontFamily="subheading" fontSize="sm">
                Don't worry, no link is kept between your identity record and your wallet address.
              </Text>
            </>
          ),
        footer: (
          <View justifyContent="center" width="full" flexDirection="row">
            <ArrowButton
              px="6px"
              text={"VERIFY I'M HUMAN"}
              onPress={verify}
              textInteraction={{ hover: { color: "white" } }}
            />
          </View>
        )
      }
    }),
    [textColor, verify, loading, claimLoading, claiming]
  );

  const claimModalProps: Omit<BasicModalProps, "modalVisible"> = useMemo(
    () =>
      firstClaim
        ? {
            header: (
              <>
                <Title fontSize="2xl" mb="2" lineHeight="43px">
                  Your G$ tokens are ready!
                </Title>
                <Text color={textColor} fontSize="sm">
                  To claim, confirm the transaction in your wallet
                </Text>
              </>
            ),
            body: (
              <Box display="flex" justifyContent="center" alignItems="center">
                <Image source={FirstClaimYay} w="220px" h="180px" />
              </Box>
            ),
            closeText: "",
            hasTopBorder: false,
            hasBottomBorder: false
          }
        : {
            header:
              loading || claimLoading ? (
                <Box backgroundColor={"white"}>
                  <Title fontSize="xl" mb="2" fontWeight="bold" lineHeight="36px">
                    Action Required
                  </Title>
                  <Text color={textColor} fontFamily="subheading" fontWeight="normal" fontSize="md">
                    To complete this action, continue in your wallet.
                  </Text>
                </Box>
              ) : (
                actionModalBody.verify.header
              ),
            body: actionModalBody.verify.body,
            footer: isWhitelisted || loading || claimLoading ? undefined : actionModalBody.verify.footer,
            closeText: "x",
            hasBottomBorder: false
          },
    [firstClaim, textColor, loading, isWhitelisted, claimLoading]
  );

  const finalModalProps: Omit<BasicModalProps, "modalVisible"> = useMemo(
    () =>
      claimed && isWhitelisted
        ? {
            header: (
              <>
                <Title mb="2" fontSize="xl" lineHeight="36px">
                  Congrats! You claimed G$ today
                </Title>
                <Text color={textColor} fontSize="sm">
                  Why not tell your friends on social media?
                </Text>
                <Text color="primary" fontSize="sm">
                  Don't forget to tag us.
                </Text>
                <Box display="flex" flexDir="row" justifyContent="center" alignItems="center" mt="5">
                  <HStack space={10}>
                    <SocialsLink network="facebook" logo={FbIcon} url="https://facebook.com" />
                    <SocialsLink network="twitter" logo={TwitterIcon} url="https://twitter.com/gooddollarorg" />
                    <SocialsLink network="linkedin" logo={LinkedInIcon} url="https://linkedin.com/" />
                  </HStack>
                </Box>
              </>
            ),
            body: (
              <Box display="flex" justifyContent="center" alignItems="center">
                <Image source={SocialShare} w="100px" h="100px" style={{ resizeMode: "contain" }} />
              </Box>
            ),
            closeText: "x",
            hasTopBorder: false,
            hasBottomBorder: false
          }
        : {
            header: (
              <>
                <Title mb="2" color="main" fontSize="xl" lineHeight="36px">
                  Waiting for confirmation
                </Title>
                <Text color={textColor} fontSize="sm">
                  Please wait for the transaction to be validated.
                </Text>
              </>
            ),
            body: actionModalBody.verify.body,
            closeText: "x",
            hasTopBorder: false,
            hasBottomBorder: false
          },
    [claimed, isWhitelisted, claiming]
  );

  const handleClaim = async () => {
    try {
      const success = await claim();
      if (success !== true) {
        setClaimLoading(false);
        return;
      }

      showFinalizationModal();
    } finally {
      setClaimLoading(false);
      hideActionModal();
    }
  };

  const handleModalOpen = useCallback(
    async (first = false) => {
      if (isNil(isWhitelisted)) {
        // no value for isWhitelisted means we are not having a established connection to bc yet but should expect soon, handled by useEffect
        setWhitelistLoading(true);
        return;
      }

      setFirstClaim(first);
      // we set claimLoading here because it only updates state-vars after current callback or effect has completed
      // which is why it cannot be set in the handleClaim callback as it would be set too late
      setClaimLoading(true);
      showActionModal();

      if (isWhitelisted) {
        await handleClaim();
        return;
      } else {
        // means we no longer are expecting a claimCall and actionModal should show default verify uniqueness message
        setClaimLoading(false);
      }

      if (fuseWhitelisted && syncStatus) {
        const success = await syncStatus;

        if (!success) {
          return;
        }

        await handleClaim();
      }
    },
    [claim, hideActionModal, isWhitelisted, fuseWhitelisted, syncStatus, account, claimLoading, setWhitelistLoading]
  );

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted || !claimAmount) {
      return "CLAIM NOW";
    }

    const amount = G$Amount("G$", claimAmount, chainId ?? defaultChainId, defaultEnv);

    return "CLAIM NOW " + amount.format({ fixedPrecisionDigits: 2, useFixedPrecision: true, significantDigits: 2 });
  }, [isWhitelisted, account, chainId, claimAmount]);

  // handles a delay in fetching isWhitelisted after just being connected
  useEffect(() => {
    if (whitelistLoading) {
      // making sure it only runs once (is set after useEffect completes)
      setWhitelistLoading(false);
      handleModalOpen().catch(noop);
    }
  }, [isWhitelisted, whitelistLoading, setWhitelistLoading]);

  // temporary transaction status check, to trigger final 2 modals: Awaiting validation + Social Share
  // will be replaced with solution to issue: https://github.com/GoodDollar/GoodProtocolUI/issues/366 & https://github.com/GoodDollar/GoodProtocolUI/issues/365
  // which should handle tx-statuses and confirm modals more globally
  useEffect(() => {
    if (claiming) {
      hideActionModal();
      showFinalizationModal();
    }
  }, [claiming]);

  // trigger claim when user succesfully has verified through FV
  // uses the first claimer flow
  useEffect(() => {
    const doClaim = async () => {
      if (!claimed && isVerified && account) {
        setFirstClaim(true);
        showActionModal();
        await handleClaim();
        setClaimLoading(true);
      }
    };

    doClaim().catch(noop);
  }, [isVerified, account, claimed]);

  if (isWhitelisted && (claimed || claiming)) {
    return <FinalizationModal {...finalModalProps} />;
  }

  return (
    <View flex={1} w="full" {...props}>
      <View w="full" alignItems="center" pt="8" pb="8">
        <Web3ActionButton
          text={buttonTitle}
          web3Action={handleModalOpen}
          disabled={claimed}
          variant="round"
          supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
          handleConnect={handleConnect}
          onEvent={onEvent}
        />
        <Text variant="shadowed" fontSize="md" />
      </View>
      <ActionModal {...claimModalProps} />
    </View>
  );
};

export default ClaimButton;
