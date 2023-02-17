import React, { useEffect, useCallback, useMemo, useState } from "react";
import { SupportedChains, useClaim, useGetEnvChainId, useWhitelistSync, G$Amount } from "@gooddollar/web3sdk-v2";
import { Text, View, useColorModeValue, Spinner } from "native-base";

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
import { noop } from "lodash";
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
  const textColor = useColorModeValue("goodGrey.500", "white");
  const { chainId: defaultChainId, defaultEnv } = useGetEnvChainId();
  const [requiredChain, setRequiredChain] = useState(SupportedChains.CELO);
  const { fuseWhitelisted, syncStatus } = useWhitelistSync();

  useEffect(() => {
    switch (chainId ?? defaultChainId) {
      case 122:
        setRequiredChain(account ? SupportedChains.FUSE : SupportedChains.CELO);
        break;
      default:
        setRequiredChain(SupportedChains.CELO);
        break;
    }
  }, [chainId, defaultChainId, account]);

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

      if (success !== true || first === false) {
        return;
      }

      showFirstClaimModal();
    } finally {
      setClaimLoading(false);
      hideActionModal();
    }
  };

  const handleModalOpen = useCallback(
    async (first = false) => {
      setFirstClaim(first);
      showActionModal();

      if (isWhitelisted) {
        setClaimLoading(true);
        await handleClaim(first);
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
    },
    [claim, hideActionModal, showFirstClaimModal, isWhitelisted, fuseWhitelisted, syncStatus]
  );

  useEffect(() => {
    const doClaim = async () => {
      if (isVerified && account) {
        showActionModal();
        setClaimLoading(true);
        await handleClaim(true);
      }
    };

    doClaim().catch(noop);
  }, [isVerified, account]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted || !claimAmount) {
      return "CLAIM NOW";
    }

    const amount = G$Amount("G$", claimAmount, chainId ?? defaultChainId, defaultEnv);

    return "CLAIM NOW " + amount.format({ useFixedPrecision: true, significantDigits: 2 });
  }, [isWhitelisted, account, chainId, claimAmount]);

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
          handleConnect={handleConnect}
        />
        <Text variant="shadowed" fontSize="md" />
      </View>
      <ActionModal {...claimModalProps} />
    </View>
  );
};

export default ClaimButton;
