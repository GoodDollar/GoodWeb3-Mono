import React, { FC, useMemo, useCallback, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Box, Text, useColorModeValue } from "native-base";
import BasePressable from "../buttons/BasePressable";
import { Title } from "../layout";
import BackToSchool from "../../assets/images/backtoschool.png";
import { Image } from "../images";
import { openLink } from "@gooddollar/web3sdk-v2";

export interface SwitchChainProps {
  /**  during a active switch request, the modal pops up */
  switching: boolean;
}

const SwitchChainActionModal: FC<SwitchChainProps> = ({ switching }: { switching: boolean }) => {
  const { Modal: SwitchActionModal, showModal, hideModal } = useModal();
  const textColor = useColorModeValue("goodGrey.500", "white");

  const openNotionTab = useCallback(async () => {
    const link = "https://www.notion.so/gooddollar/User-Guides-24dd615eb7804792a44057b96b40147d";
    await openLink(link, "_blank");
  }, []);

  useEffect(() => {
    switching ? showModal() : hideModal();
  }, [switching, showModal, hideModal]);

  const switchChainModalCopy = useMemo(
    () => ({
      header: (
        <Box backgroundColor={"white"}>
          <Title fontSize="xl" mb="2" fontWeight="bold" lineHeight="36px">
            Action Required
          </Title>
          <Text color={textColor} fontFamily="subheading" fontWeight="normal" fontSize="md">
            To complete this action, switch networks in your wallet.
          </Text>
        </Box>
      ),
      body: (
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
          onPress={openNotionTab}
        >
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
      )
    }),
    [textColor, openNotionTab]
  );

  return <SwitchActionModal {...switchChainModalCopy} />;
};

export default SwitchChainActionModal;
