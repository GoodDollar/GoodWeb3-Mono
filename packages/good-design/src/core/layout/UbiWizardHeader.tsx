import React, { FC, PropsWithChildren, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { ArrowBackIcon, Pressable, View } from "native-base";

import { TransText } from "./Trans";
import { RedTentProps } from "../../apps/goodid/types";
import { useEthers } from "@usedapp/core";
import { SupportedChains } from "@gooddollar/web3sdk-v2";

const HeaderTitles = {
  default: /*i18n*/ "Claim",
  redtent: /*i18n*/ "GoodID Upgrade"
};

export const UbiWizardHeader: FC<
  PropsWithChildren<{ onDone: RedTentProps["onDone"]; onExit: () => void; withNavBar: boolean }>
> = ({ onDone, onExit, withNavBar = false, ...props }) => {
  const { activeStep } = useWizard();
  const { chainId } = useEthers();

  const handleBack = useCallback(() => {
    if (activeStep === 1 && chainId === SupportedChains.CELO) {
      void onDone(true);
    } else {
      onExit();
    }
  }, [activeStep]);

  return withNavBar ? (
    <View
      bg="gdPrimary"
      justifyContent={"center"}
      alignItems={"center"}
      height={12}
      flexDir={"row"}
      width="100%"
      minWidth="343"
      paddingX={4}
      mb={6}
      {...props}
    >
      <View position={"relative"} display={"flex"} width={15}>
        <Pressable onPress={handleBack}>
          <ArrowBackIcon color="white" />
        </Pressable>
      </View>
      <View flex={1} flexDirection={"row"} justifyContent={"center"} paddingRight={4}>
        <TransText
          t={activeStep === 1 && chainId === SupportedChains.CELO ? HeaderTitles.redtent : HeaderTitles.default}
          color="white"
          fontFamily="subheading"
          fontSize="sm"
          fontWeight="500"
          lineHeight={19}
        />
      </View>
    </View>
  ) : null;
};
