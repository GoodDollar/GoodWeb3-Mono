import React, { useCallback, useState } from "react";
import { HStack, Pressable, Spinner, Text, useBreakpointValue, VStack } from "native-base";
import { SupportedChains, useFVLink } from "@gooddollar/web3sdk-v2";
import Clipboard from "@react-native-clipboard/clipboard";

import { useGoodId } from "../../../hooks/useGoodId";
import { GoodIdCard } from "../components";

import { Image } from "../../../core/images";
import { Title, TransText } from "../../../core/layout";
import { Web3ActionButton } from "../../../advanced";
import { truncateMiddle } from "../../../utils";
import { withTheme } from "../../../theme/hoc/withTheme";

import FaceIcon from "../../../assets/images/face.png";
import CopyIcon from "../../../assets/images/copy.png";
import WalletIcon from "../../../assets/images/wallet.png";

const ActionButtonRound = ({ ...props }) => (
  <Pressable
    w="42"
    h="42"
    onPress={props.onPress}
    backgroundColor={props.color}
    borderRadius="50"
    justifyContent="center"
    alignItems="center"
  >
    <Image source={props.icon} w={6} h={6} resizeMode="contain" />
  </Pressable>
);

const FaceId = ({ ...props }) => {
  const { getFvSig } = useFVLink();
  const [fvId, setFvId] = useState<string | undefined>(undefined);

  const truncFaceId = truncateMiddle(fvId, 11);

  const retreiveFaceId = useCallback(async () => {
    const sig = await getFvSig();
    setFvId(sig.slice(0, 42));
  }, [getFvSig]);

  const margin = useBreakpointValue({
    base: "1",
    lg: "0"
  });

  const copyFvId = useCallback(() => {
    if (!fvId) return;
    Clipboard.setString(fvId);
  }, [fvId]);

  return (
    <VStack width="100%">
      <HStack {...props}>
        <HStack
          backgroundColor="goodBlack.400"
          w="42"
          h="42"
          borderRadius="50"
          justifyContent="center"
          alignItems="center"
        >
          <Image source={FaceIcon} w={6} h={6} resizeMode="contain" />
        </HStack>

        <VStack width="100%" flexShrink={1}>
          <TransText t={/*i18n*/ "FaceId"} variant="sm-grey-700" />
          {truncFaceId ? <Text variant="sm-grey-400">{truncFaceId}</Text> : null}
        </VStack>
        {!truncFaceId ? (
          <Web3ActionButton
            ml="4"
            mt={margin}
            padding="0"
            px="4"
            text={/*i18n*/ "Show my FaceId"}
            web3Action={retreiveFaceId}
            variant="outlined"
            innerText={{ fontSize: 14, color: "gdPrimary" }}
            innerIndicatorText={{ fontSize: 14, color: "gdPrimary" }}
            supportedChains={[SupportedChains.FUSE, SupportedChains.CELO]}
          />
        ) : (
          <HStack space={2}>
            <ActionButtonRound onPress={copyFvId} icon={CopyIcon} color="gdPrimary" />
          </HStack>
        )}
      </HStack>
    </VStack>
  );
};

export const GoodIdDetails = withTheme({ name: "GoodIdDetails" })(
  ({
    account,
    withHeader = false,
    isVerified = false,
    ...props
  }: {
    account: string;
    isVerified?: boolean;
    withHeader?: boolean;
    container?: any;
    header?: any;
    innerContainer?: any;
    section?: any;
  }) => {
    const { container, header, innerContainer, section } = props;
    const { certificateSubjects, expiryFormatted, isWhitelisted } = useGoodId(account);
    const truncAccount = truncateMiddle(account, 11);

    const copyAddress = useCallback(() => {
      if (!account) return;
      Clipboard.setString(account);
    }, [account]);

    if (!account || (!isVerified && isWhitelisted === undefined)) return <Spinner variant="page-loader" size="lg" />;

    return (
      <VStack {...container}>
        {withHeader ? (
          <VStack {...header}>
            <Title variant="title-gdblue" fontSize="2xl">{`GoodID`}</Title>
            <TransText
              t={
                /*i18n*/ "Your GoodID unlocks access to UBI, financial services, humanitarian funds and \n other special offers and opportunities to earn GoodDollars."
              }
              variant="sm-grey-650"
              textAlign="center"
            />
          </VStack>
        ) : null}

        <VStack {...innerContainer}>
          <GoodIdCard
            ml="auto"
            mr="auto"
            account={account}
            isWhitelisted={isWhitelisted ?? isVerified}
            certificateSubjects={certificateSubjects}
            expiryDate={expiryFormatted}
            width="100%"
          />
          <VStack width="100%" space={2}>
            <HStack {...section}>
              <HStack
                w="42"
                h="42"
                backgroundColor="goodBlack.400"
                borderRadius="50"
                justifyContent="center"
                alignItems="center"
              >
                <Image
                  source={WalletIcon}
                  w={6}
                  h={6}
                  accessibilityLabel="Wallet"
                  borderRadius="50"
                  resizeMode="contain"
                />
              </HStack>
              <VStack flexShrink={1} width="100%">
                <TransText t={/*i18n*/ "My Wallet Address"} variant="sm-grey-700" />
                <Text variant="sm-grey-400">{truncAccount}</Text>
              </VStack>
              <ActionButtonRound onPress={copyAddress} icon={CopyIcon} color="gdPrimary" />
            </HStack>
            <FaceId {...section} />
          </VStack>
        </VStack>
        <TransText
          t={
            /*i18n*/ "This is the only wallet that is verified and that you may use to claim GoodDollars. If you want to verify and claim with another wallet, you may do so after the expiry date shown above."
          }
          variant="browse-wrap"
          textAlign="center"
        />
      </VStack>
    );
  }
);
