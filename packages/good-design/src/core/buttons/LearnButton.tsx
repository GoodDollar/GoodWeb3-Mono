import React, { useCallback } from "react";
import { Box, Text } from "native-base";
import BasePressable from "./BasePressable";
import { openLink } from "@gooddollar/web3sdk-v2";
import { Image } from "../images";
import BackToSchool from "../../assets/images/backtoschool.png";

type learnLinks = {
  transactions: string;
  bridging: string;
  network: string;
  signing: string;
};
const links: learnLinks = {
  transactions: "https://www.notion.so/gooddollar/How-do-transactions-work-in-web3-ccf11b4e16874a1682722a20c4e24742",
  bridging: "", // todo: add guide to notion
  network: "https://www.notion.so/gooddollar/What-is-a-web3-network-4bf6c8efecab4834b25c006f57687cc6",
  signing: "https://www.notion.so/gooddollar/What-is-signing-b0019fe6c43241068050c9aa16e87ee1"
};

const linkCopys = {
  transactions: "How do transactions work?",
  bridging: "How does bridging work?",
  network: "What is a web3 network?",
  signing: "What is signing?"
};

const LearnButton = ({ source }: { source: string }) => {
  const key = source as keyof typeof links;
  const copy = linkCopys[key];

  const openNotionTab = useCallback(async () => {
    const link = links[key];

    await openLink(link, "_blank");
  }, [key]);

  return (
    <BasePressable variant="externalLink" onPress={openNotionTab}>
      <Box display="flex" w="60%" alignSelf="flex-start" p={2}>
        <Text color="lightBlue" fontSize="sm">
          LEARN
        </Text>
        <Text color="main" lineHeight="normal" fontSize="sm" fontWeight="normal" fontFamily="subheading" textDecoration>
          {copy}
        </Text>
      </Box>
      <Box>
        <Image source={BackToSchool} w="92px" h="111px" margin-right="0" style={{ resizeMode: "contain" }} />
      </Box>
    </BasePressable>
  );
};

export default LearnButton;
