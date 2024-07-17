import React, { useCallback } from "react";
import { Box, Text } from "native-base";
import { openLink } from "@gooddollar/web3sdk-v2";

import BasePressable from "./BasePressable";
import { Image } from "../images";

export type learnSources = "send" | "bridging" | "network" | "sign" | "identity";

type LearnButtonType = {
  icon?: any;
  label?: string;
  learnTitle?: string;
  link?: string;
};

const LearnButton = ({ icon, label, learnTitle, link }: LearnButtonType) => {
  const openNotionTab = useCallback(async () => {
    if (link) {
      await openLink(link, "_blank");
    }
  }, [link]);

  return (
    <BasePressable variant="externalLink" onPress={openNotionTab} w="100%">
      <Box display="flex" w="60%" alignSelf="flex-start" p={2}>
        <Text color="lightBlue" fontSize="sm">
          {learnTitle}
        </Text>
        <Text color="main" fontSize="sm" fontWeight="normal" fontFamily="subheading" textDecoration>
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
