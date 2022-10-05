import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { useClaim, useFVLink } from "@gooddollar/web3sdk-v2/src";
import { noop } from 'lodash'
import { View, Text, Modal, IModalProps } from "native-base";

import { BaseButton, BaseButtonProps } from "./BaseButton";
import { openLink } from "../utils/linking";

interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
}

type FVModalProps = IModalProps & FVFlowProps;

export type ClaimButtonProps = BaseButtonProps & FVFlowProps;

function FVModal({ firstName, method, onClose = noop, ...props }: FVModalProps) {
  const fvlink = useFVLink();

  const login = useCallback(async () => {
    await fvlink?.getLoginSig();
  }, [fvlink]);

  const sign = useCallback(async () => {
    await fvlink?.getFvSig();
  }, [fvlink]);

  const verify = useCallback(async () => {
    switch (method) {
      case 'redirect': {
        const link = fvlink?.getLink(firstName, document.location.href, false);

        if (link) {
          openLink(link);
        }
        break;
      }
      case 'popup':
      default: {
        const link = await fvlink?.getLink(firstName, undefined, true);

        if (link) {
          openLink(link, '_blank', { width: '800px', height: 'auto' })
        }
        break;
      }
    }

    onClose()
  }, [fvlink, method, firstName, onClose])

  return (
    <Modal {...props} animationPreset="slide" onClose={onClose}>
      <View style={styles.containeralt}>
        <View>
          <Text>To verify your identity you need to sign TWICE with your wallet.</Text>
          <Text>First sign your address to be whitelisted</Text>
          <Text>
            Second sign your self sovereign anonymized identifier, so no link is kept between your identity record and
            your address.
          </Text>
        </View>
        <BaseButton onPress={login} text={"Step 1 - Login"} />
        <BaseButton onPress={sign} text={"Step 2 - Sign unique identifier"} />
        <BaseButton onPress={verify} text={"Step 3 - Verify"} />
        <BaseButton color="red" onPress={onClose()} text={"Close"} />
      </View>
    </Modal>
  );
};

export function ClaimButton({ firstName, method }: ClaimButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh ? "everyBlock" : "never");
  const { status: claimStatus } = claimCall?.state || {}

  const handleClose = useCallback(() => setShowModal(false), [setShowModal]);

  const handleClaim = useCallback(async () => {
    if (!isWhitelisted) {
      return setShowModal(true);
    }

    await claimCall.send();
  }, [isWhitelisted, setShowModal, claimCall]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted) {
      return "Verify Uniqueness";
    }

    if (claimAmount.toNumber() > 0) {
      return `Claim ${claimAmount}`;
    }

    return `Claim at: ${claimTime}`;
  }, [isWhitelisted, claimAmount, claimTime]);

  useEffect(() => {
    setRefresh(!isWhitelisted || ["Mining", "PendingSignature"].includes(claimStatus));
  }, [isWhitelisted, claimStatus]);

  return (
    <View>
      <View flex={1} alignItems="center" justifyContent="center">
        <FVModal method={method} isOpen={showModal} onClose={handleClose} firstName={firstName}></FVModal>
      </View>
      <BaseButton text={buttonTitle} onPress={handleClaim} />
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
