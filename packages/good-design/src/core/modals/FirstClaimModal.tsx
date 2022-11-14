import { noop } from "lodash";
import React, { FC, useCallback, useState } from "react";
import { Modal, Spinner, Text, View, Pressable, IModalProps } from "native-base";
import { useFVLink } from "@gooddollar/web3sdk-v2";

import CrossIcon from "./cross";
import { openLink } from "../utils/linking";
import ButtonAction from "../buttons/ActionButton";
import { FVModalProps } from "../buttons/ClaimButton";
import { withTheme, withThemingTools } from "../../theme";

export interface FirstClaimModalProps extends IModalProps {}

const FirstClaimModal: FC<FirstClaimModalProps> = ({ onClose = noop, ...props }) => {
  return (
    <Modal {...props} animationPreset="slide" onClose={onClose}>
      <View
        alignItems="center"
        backgroundColor="#fff"
        borderColor="#eee"
        borderRadius={10}
        borderWidth={1}
        justifyContent="space-between"
        height={270}
        margin="auto"
        py={30}
        px={35}
      >
        <Pressable
          position="absolute"
          top={6}
          right={6}
          fontSize={11}
          fontWeight="bold"
          backgroundColor="#fff"
          onPress={onClose}
          zIndex={10}
        >
          <CrossIcon />
        </Pressable>
        <View>
          <Text color="text1" fontWeight="bold">
            Your first claim is ready!
          </Text>
          <Text color="text1">To complete it, sign in your wallet</Text>
        </View>
      </View>
    </Modal>
  );
};

export const theme = {
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => ({
    justifyContent: "center",
    px: 4,
    minWidth: "100%"
  }))
};

export default withTheme()(FirstClaimModal);
