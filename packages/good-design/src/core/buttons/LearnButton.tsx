import React, { useCallback } from "react";
import { Box } from "native-base";
import { openLink } from "@gooddollar/web3sdk-v2";

import BasePressable from "./BasePressable";
import { Image } from "../images";
import { linksNew } from "../constants";
import { TransText } from "../layout";

export type learnSources = "send" | "bridging" | "network" | "sign" | "identity";

type LearnButtonType = {
  icon?: any;
  label?: string;
  link?: string;
  type: keyof typeof linksNew;
};

const LearnButton = ({ type }: LearnButtonType) => {
  const { link, label, icon } = linksNew[type];
  const openNotionTab = useCallback(async () => {
    if (link) {
      await openLink(link, "_blank");
    }
  }, [link]);

  return (
    <BasePressable variant="externalLink" onPress={openNotionTab} w="100%">
      <Box display="flex" w="60%" alignSelf="flex-start" p={2}>
        <TransText color="lightBlue" fontSize="sm" t={/*i18n*/ "Learn"} />
        <TransText
          color="main"
          fontSize="sm"
          fontWeight="normal"
          fontFamily="subheading"
          textDecoration
          t={label ?? ""}
        />
      </Box>
      <Box>
        <Image source={icon} w="92px" h="111px" margin-right="0" style={{ resizeMode: "contain" }} />
      </Box>
    </BasePressable>
  );
};

export default LearnButton;
