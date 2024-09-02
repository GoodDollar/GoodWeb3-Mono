import React from "react";
import { noop } from "lodash";
import { Center, HStack, Text, VStack } from "native-base";
import { SupportedChains } from "@gooddollar/web3sdk-v2";

import { Image } from "../../images";

import BasicStyledModal from "./BasicStyledModal";
import { truncateMiddle } from "../../../utils/string";
import { isReceiveTransaction } from "../../../apps/ubi/utils/transactionType";

import ReceiveIconLegacy from "../../../assets/images/receive-icon-legacy.png";
import { GoodButton } from "../../buttons";
import { GdAmount } from "../../layout";
import { ExplorerLink } from "../..";
import UnknownAvatarSvg from "../../../assets/svg/unknown-avatar.svg";
import { getTxIcons } from "../../../utils/icons";

const TxDetailsContent = ({ tx, color, network }: any) => {
  const { account, contractAddress, contractName, date, tokenValue, type } = tx;

  const { txIcon, networkIcon, contractIcon } = getTxIcons(tx);
  const txDate = date ? date.format?.("MM/DD/YYYY, HH:mm") : "";
  const trunContractAddr = truncateMiddle(contractAddress, 11);
  const trunAccountAddr = truncateMiddle(account, 11);

  return (
    <VStack space={3}>
      <Center>
        <Image source={ReceiveIconLegacy} w={137} h={135} style={{ resizeMode: "contain" }} />
      </Center>

      <VStack space={0} borderBottomColor={color} borderBottomWidth="2" paddingY="4" paddingX="1">
        <HStack justifyContent="flex-start" flexShrink={1} space={4}>
          <Image source={networkIcon} w="6" h="6" accessibilityLabel="NetworkIcon" />
          <HStack space={15} flexGrow={1} justifyContent="flex-start">
            <Text variant="4xs-grey-400" width="100%">
              {txDate}
            </Text>
            <GdAmount amount={tokenValue} options={{ prefix: "+" }} color={color} withDefaultSuffix />
          </HStack>
        </HStack>
      </VStack>

      <VStack space={0} borderBottomColor={color} borderBottomWidth="2" paddingY="4" paddingX="1">
        <HStack justifyContent="flex-start" flexShrink={1} space={4}>
          <Image source={contractIcon ?? UnknownAvatarSvg} w="8" h="8" accessibilityLabel="Test" />
          <HStack space={10} flexGrow={1} justifyContent="flex-start">
            <VStack flexGrow="1" space="0.5">
              <Text variant="4xs-grey-600" flexGrow="">
                from:{` `}
                <Text variant="4xs-grey-600" fontSize="sm">
                  {contractName}
                </Text>
                {/*todo: if gooddollar > link to ? / if pool > link to goodcollective pool 
                {isPool ? (
                  <></> todo: extend explorer-link to link to good-collective page.
                ) : (
                  // <ExplorerLink chainId={42220} />
                  
                  <Text variant="4xs-grey-600" fontSize="sm">
                    {contractName}
                  </Text>
                )} */}
              </Text>
              <ExplorerLink
                addressOrTx={contractAddress}
                chainId={network}
                text={trunContractAddr}
                fontStyle={{ fontSize: "sm", fontFamily: "subheading", fontWeight: 500 }}
                maxWidth={"60%"}
              />
            </VStack>

            <Image w="34" h="34" source={txIcon} />
          </HStack>
        </HStack>
      </VStack>

      {type !== "claim-start" ? (
        <VStack space={0} borderBottomColor={color} borderBottomWidth="2" paddingY="4" paddingX="1">
          <HStack justifyContent="flex-start" flexShrink={1} space={4}>
            <Image source={UnknownAvatarSvg} w="8" h="8" accessibilityLabel="Test" />
            <HStack space={10} flexGrow={1} justifyContent="flex-start">
              <VStack flexGrow="1" space="0.5">
                <Text variant="4xs-grey-600" flexGrow="1">
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
                  maxWidth={"42%"}
                />
              </VStack>
              <></>
            </HStack>
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
      <HStack justifyContent="space-between" marginTop="2" width="100%">
        <VStack space="0.5">
          {type !== "claim-start" ? (
            <>
              <Text variant="4xs-grey-600">TX Details</Text>
              <ExplorerLink
                addressOrTx={txHash}
                chainId={network}
                text={trunTxHash}
                fontStyle={{ fontSize: "sm", fontFamily: "subheading", fontWeight: 500 }}
              />
            </>
          ) : null}
        </VStack>

        <GoodButton onPress={onClose} width="100" size="xs" paddingTop={2} paddingBottom={2}>
          Ok
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
  const color = isClaimStart ? "goodGrey.650" : isReceive ? "txGreen" : "goodRed.200";
  const network = SupportedChains[tx.network as keyof typeof SupportedChains];

  return (
    <BasicStyledModal
      {...props}
      type="ctaX"
      modalStyle={{ borderLeftWidth: "10", borderLeftColor: color }}
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
