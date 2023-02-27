import React, { useEffect, useCallback, useMemo, useState } from "react";
import { SupportedChains, useClaim, useGetEnvChainId, useWhitelistSync, G$Amount } from "@gooddollar/web3sdk-v2";
import { Text, View, useColorModeValue, Spinner, Box } from "native-base";

import { useQueryParam } from "../../hooks/useQueryParam";
import { Web3ActionButton } from "../../advanced";
import { useFVModalAction } from "../../hooks/useFVModalAction";
import ActionButton from "./ActionButton";
import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import { FVFlowProps } from "./types";
import { Image } from "../images";
import FirstClaimYay from "../../assets/images/yay.png";
import SocialShare from "../../assets/images/social_share.png";
import { BasicModalProps } from "../modals/BasicModal";
import { noop, isNil } from "lodash";
import { useEthers } from "@usedapp/core";

const ClaimButton = ({
  firstName,
  method,
  refresh,
  claimed,
  claim,
  chainId,
  handleConnect,
  redirectUrl,
  ...props
}: FVFlowProps) => {
  const { account } = useEthers();
  const { Modal: FirstClaimModal, showModal: showFirstClaimModal } = useModal();
  const { Modal: ActionModal, showModal: showActionModal, hideModal: hideActionModal } = useModal();
  const [claimLoading, setClaimLoading] = useState(false);

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
  const isVerifiedTest = true;
  const textColor = useColorModeValue("goodGrey.500", "white");
  const { chainId: defaultChainId, defaultEnv } = useGetEnvChainId();
  const { fuseWhitelisted, syncStatus } = useWhitelistSync();

  // TODO:  replace placeholder loader with styled loader
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
            <ActionButton color="white" text={"Verify Uniqueness"} onPress={verify} bg="main" />
          </View>
        )
      }
    }),
    [textColor]
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
            body: loading || claimLoading ? <Spinner color="emerald.500" /> : actionModalBody.verify.body,
            footer: isWhitelisted || loading || claimLoading ? undefined : actionModalBody.verify.footer,
            closeText: "",
            hasBottomBorder: false
          },
    [firstClaim, textColor, loading, isWhitelisted, claimLoading]
  );

  const handleClaim = async (first: boolean) => {
    try {
      const success = await claim();
      console.log("handleClaim -->", { success });
      if (success !== true || first === false) {
        return;
      }

      showFirstClaimModal();
    } finally {
      setClaimLoading(false);
      hideActionModal();
    }
  };

  // handles a delay in fetching isWhitelisted after just being connected
  useEffect(() => {
    claimLoading && isWhitelisted && handleModalOpen().catch(noop);
  }, [isWhitelisted]);

  // trigger claim when user succesfully has verified through FV
  // uses the first claimer flow
  useEffect(() => {
    const doClaim = async () => {
      if (isVerified && account) {
        setFirstClaim(true);
        showActionModal();
        await handleClaim(true);
        setClaimLoading(true);
      }
    };

    doClaim().catch(noop);
  }, [isVerified, account]);

  const handleModalOpen = useCallback(
    async (first = false) => {
      if (isNil(isWhitelisted)) {
        setClaimLoading(true);
        return;
      }

      setFirstClaim(first);
      showActionModal();

      if (isWhitelisted) {
        setClaimLoading(true);
        await handleClaim(false);
        return;
      }

      if (fuseWhitelisted && syncStatus) {
        const success = await syncStatus;

        if (!success) {
          return;
        }

        setClaimLoading(true);
        await handleClaim(true);
      }

      setClaimLoading(false);
    },
    [claim, hideActionModal, showFirstClaimModal, isWhitelisted, fuseWhitelisted, syncStatus, account]
  );

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted || !claimAmount) {
      return "CLAIM NOW";
    }

    const amount = G$Amount("G$", claimAmount, chainId ?? defaultChainId, defaultEnv);

    return "CLAIM NOW " + amount.format({ fixedPrecisionDigits: 2, useFixedPrecision: true, significantDigits: 2 });
  }, [isWhitelisted, account, chainId, claimAmount]);

  useEffect(() => {
    if (isVerifiedTest) showFirstClaimModal();
  }, [isVerifiedTest]);

  if (isVerifiedTest) {
    return (
      <FirstClaimModal
        header={
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
            <Box>** Social share here **</Box>
          </>
        }
        body={
          <Box display="flex" justifyContent="center" alignItems="center">
            <Image source={SocialShare} w="100px" h="100px" style={{ resizeMode: "contain" }} />
          </Box>
        }
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
          supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
          handleConnect={handleConnect}
        />
        <Text variant="shadowed" fontSize="md" />
      </View>
      <ActionModal {...claimModalProps} />
    </View>
  );
};

export default ClaimButton;
