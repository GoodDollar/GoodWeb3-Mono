import { noop } from "lodash";
import { useFVLink } from "@gooddollar/web3sdk-v2";
import React, { useCallback, useState } from "react";
import { openLink } from "../utils";
import { Modal, Spinner, Text, View } from "native-base";
import { TouchableOpacity } from "react-native";
import { colors } from "../../constants";
import { ButtonAction, FVModalProps } from "../buttons";
import { withTheme } from "../../theme/hoc/withTheme";
// import { ClaimButtonStyles } from "../buttons/ClaimButton.theme"; // use props

// const cross = require("../../assets/svg/cross.svg") as string;
const cross = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.62728 10.9236L5.30765 14.2432L3.48842 12.424L6.80805 9.10434L3.31963 5.61592L5.21388 3.72167L8.7023 7.21009L12.0219 3.89046L13.8412 5.70969L10.5215 9.02932L14.01 12.5177L12.1157 14.412L8.62728 10.9236Z"
      fill="#696D73"
    />
  </svg>
);

export function FVModal({ firstName, method, styles, onClose = noop, ...props }: FVModalProps) {
  const fvlink = useFVLink();
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async () => {
    setLoading(true);
    await fvlink?.getLoginSig();
    await fvlink?.getFvSig();
    setLoading(false);

    switch (method) {
      case "redirect": {
        const link = fvlink?.getLink(firstName, document.location.href, false);

        if (link) {
          openLink(link);
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
      <View style={styles.containeralt}>
        <TouchableOpacity style={styles.close} onPress={onClose}>
          {cross}
        </TouchableOpacity>
        <View>
          <Text color={colors.text1}>To verify your identity you need to sign TWICE with your wallet.</Text>
          <Text color={colors.text1}>First sign your address to be whitelisted</Text>
          <Text color={colors.text1}>
            Second sign your self sovereign anonymized identifier, so no link is kept between your identity record and
            your address.
          </Text>
        </View>
        {loading ? (
          <Spinner />
        ) : (
          <View style={styles.btnsWrap}>
            <ButtonAction text={"Verify Uniqueness"} onPress={verify} />
          </View>
        )}
      </View>
    </Modal>
  );
}

//
const FvModalWithTheme = withTheme()(FVModal);
export default FvModalWithTheme;
