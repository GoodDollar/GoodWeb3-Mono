import React, { useCallback } from "react";
import { Box, Text } from "native-base";
import BasePressable from "./BasePressable";
import { openLink } from "@gooddollar/web3sdk-v2";
import { Image } from "../images";
import BillyWaiting from "../../assets/images/billy-waiting.png";
import BillySign from "../../assets/images/billy-sign.png";

export type learnSources = "send" | "bridging" | "network" | "sign" | "identity";
type links = { link: string; label: string; icon: any };

const linksNew: Record<learnSources, links> = {
  send: {
    link: "https://docs.gooddollar.org/frequently-asked-questions/using-gooddollar#how-do-transactions-work-in-web3",
    label: "How do transactions work?",
    icon: BillyWaiting
  },
  bridging: {
    link: "https://gooddollar.notion.site/What-is-bridging-f42ec5d3c388454bb2266411a67d93f5",
    label: "How does bridging work?",
    icon: BillyWaiting
  },
  network: {
    link: "https://gooddollar.notion.site/What-is-a-web3-network-4bf6c8efecab4834b25c006f57687cc6",
    label: "What is a web3 network?",
    icon: BillyWaiting
  },
  sign: {
    link: "https://gooddollar.notion.site/What-is-signing-b0019fe6c43241068050c9aa16e87ee1",
    label: "What is signing?",
    icon: BillySign
  },
  identity: {
    link: "https://www.notion.so/gooddollar/Get-G-873391f31aee4a18ab5ad7fb7467acb3",
    label: "Learn about the identification process",
    icon: BillySign
  }
};

type sourceOrAlt = {
  source?: learnSources;
  altSource?: links;
} & ({ source: learnSources } | { altSource: links });

const LearnButton = ({ source, altSource }: sourceOrAlt) => {
  const { link, label, icon } = source ? linksNew[source] : altSource;

  const openNotionTab = useCallback(async () => {
    await openLink(link, "_blank");
  }, [link]);

  return (
    <BasePressable variant="externalLink" onPress={openNotionTab} w="100%">
      <Box display="flex" w="60%" alignSelf="flex-start" p={2}>
        <Text color="lightBlue" fontSize="sm">
          LEARN
        </Text>
        <Text color="main" lineHeight="normal" fontSize="sm" fontWeight="normal" fontFamily="subheading" textDecoration>
          {label}
        </Text>
      </Box>
      <Box>
        <Image source={icon} w="92px" h="111px" margin-right="0" style={{ resizeMode: "contain" }} />
      </Box>
    </BasePressable>
  );
};

export default LearnButton;
