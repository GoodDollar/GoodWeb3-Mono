import React, { useEffect, useState } from "react";
import { useClaim, useFVLink } from "@gooddollar/web3sdk-v2/src";
import { View, Text, Modal, IModalProps } from "native-base";
import { BaseButton } from "./BaseButton";
import { Linking, StyleSheet } from "react-native";

export interface PageProps {
  firstName: string;
}

const FVModal = (params: IModalProps & { firstName: string }) => {
  const fvlink = useFVLink();
  const method = "popup";
  return (
    <Modal {...params} animationPreset="slide">
      <View style={styles.containeralt}>
        <View>
          <Text>To verify your identity you need to sign TWICE with your wallet.</Text>
          <Text>First sign your address to be whitelisted</Text>
          <Text>
            Second sign your self sovereign anonymized identifier, so no link is kept between your identity record and
            your address.
          </Text>
        </View>
        <BaseButton
          onPress={async () => {
            await fvlink?.getLoginSig();
          }}
          text={"Step 1 - Login"}
        />
        <BaseButton
          onPress={async () => {
            await fvlink?.getFvSig();
          }}
          text={"Step 2 - Sign unique identifier"}
        />
        <BaseButton
          onPress={async () => {
            let link;
            if (method === "popup") {
              link = await fvlink?.getLink(params.firstName, undefined, true);
              const popup = window.open(link, "_blank", "width: '800px', height: 'auto'");
            } else {
              link = fvlink?.getLink(params.firstName, document.location.href, false);
              link && Linking.openURL(link);
            }
            // console.log({ link });
            params.onClose?.();
            // params.onRequestClose?.(noop);
          }}
          text={"Step 3 - Verify"}
        />
        <BaseButton color="red" onPress={() => params.onClose?.()} text={"Close"} />
      </View>
    </Modal>
  );
};

export const ClaimButton = ({ firstName }: PageProps) => {
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh ? "everyBlock" : "never");

  const handleClaim = async () => {
    if (isWhitelisted) {
      await claimCall.send();
    } else {
      setShowModal(true);
    }
  };

  useEffect(() => {
    if (!isWhitelisted || claimCall.state.status === "Mining" || claimCall.state.status === "PendingSignature") {
      setRefresh(true);
    } else setRefresh(false);
  }, [isWhitelisted, claimCall.state]);

  const buttonTitle = () => {
    if (isWhitelisted) {
      if (claimAmount.toNumber() > 0) return `Claim ${claimAmount}`;
      else return `Claim at: ${claimTime}`;
    } else return "Verify Uniqueness";
  };

  return (
    <View>
      <View flex={1} alignItems="center" justifyContent="center">
        <FVModal isOpen={showModal} onClose={() => setShowModal(false)} firstName={firstName}></FVModal>
      </View>
      <BaseButton text={buttonTitle()} onPress={handleClaim} />
    </View>
  );
};

const styles = StyleSheet.create({
  containeralt: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#eee",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    height: 300,
    margin: "auto",
    padding: 30,
    width: 600
  }
});
