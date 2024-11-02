import React from "react";
import { noop } from "lodash";
import { Box, Center, HStack, Text, VStack } from "native-base";
import { SupportedChains } from "@gooddollar/web3sdk-v2";

import { Image } from "../../images";

import BasicStyledModal from "./BasicStyledModal";
import { truncateMiddle } from "../../../utils/string";
import { isReceiveTransaction } from "../../../apps/ubi/utils/transactionType";
import { Transaction } from "../../../apps/ubi/types";

import BillyReceive from "../../../assets/images/billy-receive.png";
import { GoodButton } from "../../buttons";
import { GdAmount } from "../../layout";
import { ExplorerLink } from "../..";
import UnknownAvatarIcon from "../../../assets/images/goodid/unknown-avatar.png";
import { getTxIcons } from "../../../utils/icons";
import { Platform } from "react-native";

const TxDetailsContent = ({ tx, color, network }: { tx: Transaction; color: string; network: number }) => {
  const { account, contractAddress, contractName, date, isPool, tokenValue, type } = tx;

  const { txIcon, networkIcon, contractIcon } = getTxIcons(tx);
  const txDate = date ? date.local().format?.("MM.DD.YYYY HH:mm") : "";
  const trunContractAddr = truncateMiddle(contractAddress, 11);
  const trunAccountAddr = truncateMiddle(account, 11);

  return (
    <VStack space={3}>
      <Center>
        <Image source={BillyReceive} w={121} h={87} style={{ resizeMode: "contain" }} />
      </Center>

      <VStack space={0} borderBottomColor={color} borderBottomWidth="2" paddingY="3" paddingX="1" width="100%">
        <HStack justifyContent="flex-start" flexShrink={1} space={4}>
          <Image source={networkIcon} w="6" h="6" accessibilityLabel="NetworkIcon" />
          <HStack space={15} flexGrow={1} justifyContent="flex-start" alignItems="center">
            <Text variant="4xs-grey-400" width="100%">
              {txDate}
            </Text>
            {tokenValue ? (
              <GdAmount amount={tokenValue} options={{ prefix: "+" }} color={color} withDefaultSuffix />
            ) : null}
          </HStack>
        </HStack>
      </VStack>

      <VStack space={0} borderBottomColor={color} borderBottomWidth="2" paddingY="3" paddingX="1" width="100%">
        <HStack justifyContent="flex-start" flexShrink={1} space={3}>
          <Image source={contractIcon ?? UnknownAvatarIcon} w="8" h="8" accessibilityLabel="Test" />
          <HStack space={10} flexGrow={1} justifyContent="space-between">
            <VStack space={0.5}>
              <Text variant="4xs-grey-600" flexGrow={1}>
                from:
                <Text variant="4xs-grey-600" fontSize="sm">
                  {contractName}
                </Text>
              </Text>
              {/* Todo: should link to gc or explorer */}
              <ExplorerLink
                addressOrTx={contractAddress}
                chainId={network}
                text={trunContractAddr}
                fontStyle={{ fontSize: "sm", fontFamily: "subheading", fontWeight: 500 }}
                isPool={isPool}
                withIcon={false}
              />
            </VStack>

            <Image w="34" h="34" source={txIcon} />
          </HStack>
        </HStack>
      </VStack>

      {type !== "claim-start" ? (
        <VStack space={0} borderBottomColor={color} borderBottomWidth="2" paddingY="3" paddingX="1" width="100%">
          <HStack justifyContent="flex-start" flexShrink={1} space={3}>
            <Image source={UnknownAvatarIcon} w="8" h="8" accessibilityLabel="Test" />
            <HStack space={10} flexGrow={1} justifyContent="flex-start">
              {/* <VStack flexGrow={1} space="0.5"> */}
              <VStack flexGrow={1} space="0.5">
                <Text variant="4xs-grey-600" flexGrow={1}>
                  To:{" "}
                  <Text variant="4xs-grey-600" fontSize="sm">
                    {/* todo: me or first-name (wallet) */}
                    Me
                  </Text>
                </Text>
                <ExplorerLink
                  addressOrTx={account}
                  chainId={network}
                  text={trunAccountAddr}
                  fontStyle={{ fontSize: "sm", fontFamily: "subheading", fontWeight: 500 }}
                  withIcon={false}
                />
              </VStack>
            </HStack>
            <Box />
          </HStack>
        </VStack>
      ) : null}
    </VStack>
  );
};

const TxDetailsFooter = ({
  txHash,
  type,
  onClose,
  network
}: {
  txHash: any;
  type: string;
  onClose?: () => void;
  network: SupportedChains;
}) => {
  const trunTxHash = truncateMiddle(txHash, 11);

  return (
    <VStack width="100%" space="2">
      <HStack justifyContent={"space-between"} marginTop="2" width="100%">
        <VStack space="0.5" flexGrow="2">
          {type !== "claim-start" ? (
            <VStack width="100%" flexGrow={2}>
              <Text variant="4xs-grey-600">TX Details</Text>
              <ExplorerLink
                addressOrTx={txHash}
                chainId={network}
                text={trunTxHash}
                fontStyle={{ fontSize: "sm", fontFamily: "subheading", fontWeight: 500 }}
                withIcon={false}
              />
            </VStack>
          ) : null}
        </VStack>

        <GoodButton
          onPress={onClose}
          {...Platform.select({ web: { width: 100 }, android: { width: 200 } })}
          width="100"
          size="xs"
          padding={0}
          margin={0}
        >
          <Text color="white" textTransform="uppercase" fontWeight="bold" fontFamily="subheading">
            OK
          </Text>
        </GoodButton>
      </HStack>
      {/*todo: see if worth to implement/find native-base equivalent 
    <div
      style={{
        backgroundImage:
          "linear-gradient(40deg, transparent 75%, rgb(255, 255, 255) 76%), linear-gradient(-40deg, transparent 75%, rgb(255, 255, 255) 76%);",
        height: "20px",
        backgroundColor: "#00000063",
        backgroundSize: "16px 16px",
        backgroundRepeat: "repeat-x",
        transform: "rotate(180deg)",
        width: "110%"
      }}
    ></div> */}
    </VStack>
  );
};

export const TxDetailsModal = ({
  open,
  onClose = noop,
  tx,
  ...props
}: {
  open: boolean;
  onClose?: () => void;
  tx: any;
}) => {
  const { transactionHash: txHash, type } = tx;
  const isClaimStart = type === "claim-start";
  const isReceive = isReceiveTransaction(tx);
  const color = isClaimStart ? "#5A5A5A" : isReceive ? "#00C3AE" : "#F87171";
  const network = SupportedChains[tx.network as keyof typeof SupportedChains];

  return (
    <BasicStyledModal
      {...props}
      type="ctaX"
      modalStyle={{ borderLeftWidth: 10, borderColor: color }}
      show={open}
      onClose={onClose}
      title={``}
      body={<TxDetailsContent {...{ tx, color, network }} />}
      footer={<TxDetailsFooter {...{ txHash, onClose, type, network }} />}
      withOverlay="dark"
      withCloseButton
    />
  );
};
