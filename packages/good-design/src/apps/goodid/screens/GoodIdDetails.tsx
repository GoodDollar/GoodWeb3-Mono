import React, { useCallback, useState } from "react";
import { HStack, Spinner, Text, useBreakpointValue, VStack } from "native-base";
import { SupportedChains, useFVLink } from "@gooddollar/web3sdk-v2";
import Clipboard from "@react-native-clipboard/clipboard";

import { useGoodId } from "../../../hooks/useGoodId";
import { GoodIdCard } from "../components";
import { YouSureModal } from "../../../core/web3/modals";

import { Image } from "../../../core/images";
import { Title } from "../../../core/layout";
import { Web3ActionButton } from "../../../advanced";
import { truncateMiddle } from "../../../utils";
import { TouchableOpacity } from "react-native";
import { withTheme } from "../../../theme";

import FaceIcon from "../../../assets/images/face.png";
import CopyIcon from "../../../assets/images/copy.png";
import WalletIcon from "../../../assets/images/wallet.png";
import TrashIcon from "../../../assets/images/trash.png";

const ActionButtonRound = ({ ...props }) => (
  <TouchableOpacity onPress={props.onPress}>
    <Image source={props.icon} w="42" h="42" backgroundColor={props.color} borderRadius="50" resizeMode="center" />
  </TouchableOpacity>
);

const FaceId = ({ ...props }) => {
  const { getFvSig, deleteFvId } = useFVLink();
  const [fvId, setFvId] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState(false);

  const truncFaceId = truncateMiddle(fvId, 11);

  const retreiveFaceId = useCallback(async () => {
    const sig = await getFvSig();
    setFvId(sig.slice(0, 42));
  }, [getFvSig]);

  const handleDeleteFaceId = useCallback(() => {
    setPendingDelete(true);
  }, [deleteFvId]);

  const deleteFaceId = useCallback(async () => {
    setPendingDelete(false);

    await deleteFvId();
  }, [fvId, deleteFvId]);

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
      <YouSureModal
        open={pendingDelete}
        type="deleteAccount"
        action={deleteFaceId}
        onClose={() => setPendingDelete(false)}
        styleProps={{ buttonStyle: { backgroundColor: "goodRed.100" } }}
      />
      <HStack {...props}>
        <Image source={FaceIcon} w="42" h="42" backgroundColor="goodBlack.400" borderRadius="50" resizeMode="center" />
        <VStack width="100%" flexShrink={1}>
          <Text variant="sm-grey-700">FaceId</Text>
          {truncFaceId ? <Text variant="sm-grey-400">{truncFaceId}</Text> : null}
        </VStack>
        {!truncFaceId ? (
          <Web3ActionButton
            ml="4"
            mt={margin}
            padding="0"
            text="Show my FaceId"
            web3Action={retreiveFaceId}
            variant="outlined"
            innerText={{ fontSize: 14 }}
            innerIndicatorText={{ color: "goodBlack.100" }}
            supportedChains={[SupportedChains.FUSE, SupportedChains.CELO]}
          />
        ) : (
          <HStack space={2}>
            <ActionButtonRound onPress={handleDeleteFaceId} icon={TrashIcon} color="goodRed.100" />
            <ActionButtonRound onPress={copyFvId} icon={CopyIcon} color="primary" />
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
    ...props
  }: {
    account: string;
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

    if (!account || isWhitelisted === undefined) return <Spinner variant="page-loader" size="lg" />;

    return (
      <VStack {...container}>
        {withHeader ? (
          <VStack {...header}>
            <Title variant="title-gdblue" fontSize="2xl">{`GoodID`}</Title>
            <Text
              variant="sm-grey-650"
              textAlign="center"
            >{`Your GoodID unlocks access to UBI, financial services, humanitarian funds and \n other special offers and opportunities to earn GoodDollars.`}</Text>
          </VStack>
        ) : null}

        <VStack {...innerContainer}>
          <GoodIdCard
            account={account}
            isWhitelisted={isWhitelisted}
            certificateSubjects={certificateSubjects}
            expiryDate={expiryFormatted}
            width="100%"
          />
          <VStack width="100%" space={2}>
            <HStack {...section}>
              <Image
                backgroundColor={"goodBlack.400"}
                source={WalletIcon}
                w="42"
                h="42"
                accessibilityLabel="Wallet"
                borderRadius="50"
                resizeMode="center"
              />
              <VStack flexShrink={1} width="100%">
                <Text variant="sm-grey-700">My Wallet Address</Text>
                <Text variant="sm-grey-400">{truncAccount}</Text>
              </VStack>
              <ActionButtonRound onPress={copyAddress} icon={CopyIcon} color="primary" />
            </HStack>
            <FaceId {...section} />
          </VStack>
        </VStack>
        <Text
          variant="browse-wrap"
          textAlign="center"
        >{`Attention: GoodDollar-verifying a new wallet address can only be \n done 24h after deleting your old face-id`}</Text>
      </VStack>
    );
  }
);
