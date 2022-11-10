import { noop } from "lodash";
import React, { useCallback, useState } from "react";
import { Modal, Spinner, Text, View, Pressable } from "native-base";
import { useFVLink } from "@gooddollar/web3sdk-v2";

import CrossIcon from "./cross";
import { openLink } from "../utils/linking";
import ButtonAction from "../buttons/ActionButton";
import { FVModalProps } from "../buttons/ClaimButton";
import { withTheme, withThemingTools } from "../../theme";

function FVModal({ firstName, method, onClose = noop, ...props }: FVModalProps) {
  const fvlink = useFVLink();
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async () => {
    setLoading(true);

    await fvlink?.getLoginSig();
    await fvlink?.getFvSig();

    switch (method) {
      case "redirect": {
        const link = fvlink?.getLink(firstName, document.location.href, false);

        if (link) {
          openLink(link, "_self");
        }
        break;
      }
      case "popup":
      default: {
        const link = await fvlink?.getLink(firstName, undefined, true);

        if (link) {
          openLink(link, "_blank", { width: "800px", height: "auto" });
        }
        break;
      }
    }

    setLoading(false);
    onClose();
  }, [fvlink, method, firstName, onClose]);

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
        width={600}
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
          <Text color="text1">To verify your identity you need to sign TWICE with your wallet.</Text>
          <Text color="text1">First sign your address to be whitelisted</Text>
          <Text color="text1">
            Second sign your self sovereign anonymized identifier, so no link is kept between your identity record and
            your address.
          </Text>
        </View>
        {loading ? (
          <Spinner />
        ) : (
          <View justifyContent="space-between" width="100%" flexDirection="row">
            <ButtonAction text={"Verify Uniqueness"} onPress={verify} />
          </View>
        )}
      </View>
    </Modal>
  );
}

export const theme = {
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => ({
    justifyContent: "center",
    px: 4,
    minWidth: "100%",
  }))
};

export default withTheme()(FVModal);

