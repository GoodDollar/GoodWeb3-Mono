import { Text, useColorModeValue, Box } from "native-base";
import React, { useEffect, useState } from "react";
import { useConfig } from "@usedapp/core";
import { useSwitchNetwork, openLink } from "@gooddollar/web3sdk-v2";
import { find } from "lodash";
import { useModal } from "../../hooks/useModal";
import { ActionHeader } from "../layout";
import { BasePressable } from "../buttons";
import { Image } from "../images";
import BackToSchool from "../../assets/images/backtoschool.png";

const openNotionTab = async () => {
  const link = "https://www.notion.so/gooddollar/User-Guides-24dd615eb7804792a44057b96b40147d";

  await openLink(link, "_blank");
};

export interface SwitchChainProps {
  children?: any;
}

/**
 * A modal to wrap your component or page with and show a modal re-active to switchChain requests
 * it assumes you have already wrapped your app with the Web3Provider out of the @gooddollar/sdk-v2 package
 * @param {boolean} switching indicating if there is a pending switch request triggered
 * @param children
 * @returns JSX.Element
 */
export const SwitchChainModal = ({ children }: SwitchChainProps) => {
  const config = useConfig();
  const [requestedChain, setRequestedChain] = useState(0);
  const { setOnSwitchNetwork } = useSwitchNetwork();
  const textColor = useColorModeValue("goodGrey.500", "white");

  const { Modal, showModal, hideModal } = useModal();

  useEffect(() => {
    if (setOnSwitchNetwork) {
      setOnSwitchNetwork(() => async (chainId: number, afterSwitch: any) => {
        if (afterSwitch !== undefined) {
          hideModal();
        } else {
          setRequestedChain(chainId);
          showModal();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOnSwitchNetwork]);

  const networkName = find(config.networks, _ => _.chainId === requestedChain)?.chainName;

  return (
    <React.Fragment>
      <Modal
        header={<ActionHeader textColor={textColor} actionText={`switch to ${networkName} in your wallet`} />}
        body={
          <BasePressable onPress={openNotionTab} variant="externalLink">
            <Box display="flex" w="70%" alignSelf="flex-start" p={3}>
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
                {`What is a web3 network >`}
              </Text>
            </Box>
            <Box>
              <Image source={BackToSchool} w="92px" h="111px" margin-right="0" style={{ resizeMode: "contain" }} />
            </Box>
          </BasePressable>
        }
        closeText="x"
      />
      {children}
    </React.Fragment>
  );
};
