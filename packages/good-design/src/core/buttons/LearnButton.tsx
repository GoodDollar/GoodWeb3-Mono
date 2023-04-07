import React, { useCallback } from "react";
import { Box, Text } from "native-base";
import BasePressable from "./BasePressable";
import { openLink } from "@gooddollar/web3sdk-v2";
import { Image } from "../images";
import BackToSchool from "../../assets/images/backtoschool.png";

type learnSources = "transactions" | "bridging" | "network" | "signing";

const linksNew: Record<learnSources, { link: string; label: string }> = {
  transactions: {
    link: "https://gooddollar.notion.site/How-do-transactions-work-in-web3-ccf11b4e16874a1682722a20c4e24742",
    label: "How do transactions work?"
  },
  bridging: {
    link: "https://gooddollar.notion.site/What-is-bridging-f42ec5d3c388454bb2266411a67d93f5",
    label: "How does bridging work?"
  },
  network: {
    link: "https://gooddollar.notion.site/What-is-a-web3-network-4bf6c8efecab4834b25c006f57687cc6",
    label: "What is a web3 network?"
  },
  signing: {
    link: "https://gooddollar.notion.site/What-is-signing-b0019fe6c43241068050c9aa16e87ee1",
    label: "What is signing?"
  }
};

const LearnButton = ({ source }: { source: learnSources }) => {
  const { link, label } = linksNew[source];

  const openNotionTab = useCallback(async () => {
    await openLink(link, "_blank");
  }, [link]);

  return (
    <BasePressable variant="externalLink" onPress={openNotionTab}>
      <Box display="flex" w="60%" alignSelf="flex-start" p={2}>
        <Text color="lightBlue" fontSize="sm">
          LEARN
        </Text>
        <Text color="main" lineHeight="normal" fontSize="sm" fontWeight="normal" fontFamily="subheading" textDecoration>
          {label}
        </Text>
      </Box>
      <Box>
        <Image source={BackToSchool} w="92px" h="111px" margin-right="0" style={{ resizeMode: "contain" }} />
      </Box>
    </BasePressable>
  );
};

export default LearnButton;
