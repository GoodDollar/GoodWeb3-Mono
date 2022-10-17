import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useClaim, useFVLink } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { View, Text, Modal, IModalProps, Spinner } from "native-base";
import { ButtonAction } from "./ActionButton";
import { openLink } from "../utils";
import { colors } from "../../constants";

// const cross = require("../../assets/svg/cross.svg") as string;
const cross = <svg
  width="18"
  height="18"
  viewBox="0 0 18 18"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M8.62728 10.9236L5.30765 14.2432L3.48842 12.424L6.80805 9.10434L3.31963 5.61592L5.21388 3.72167L8.7023 7.21009L12.0219 3.89046L13.8412 5.70969L10.5215 9.02932L14.01 12.5177L12.1157 14.412L8.62728 10.9236Z"
    fill="#696D73"
  />
</svg>


interface FVFlowProps {
  firstName: string;
  method: "popup" | "redirect";
}

type FVModalProps = IModalProps & FVFlowProps;

function FVModal({ firstName, method, onClose = noop, ...props }: FVModalProps) {
  const fvlink = useFVLink();
  const [loading, setLoading] = useState(false)

  const verify = useCallback(async () => {
    setLoading(true)
    await fvlink?.getLoginSig();
    await fvlink?.getFvSig();
    setLoading(false)

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
    setLoading(false)

    onClose();
  }, [fvlink, method, firstName, onClose]);

  if  (loading) return <Spinner/>

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
        <View style={styles.btnsWrap}>
          <ButtonAction text={"Verify Uniqueness"} onPress={verify} />
        </View>
      </View>
    </Modal>
  );
}

export function ClaimButton({ firstName, method }: FVFlowProps) {
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(refresh ? "everyBlock" : "never");
  const { status: claimStatus } = claimCall?.state || {};

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
    <View style={styles.wrapper}>
      <View flex={1} alignItems="center" justifyContent="center">
        <FVModal method={method} isOpen={showModal} onClose={handleClose} firstName={firstName} />
      </View>
      <ButtonAction text={buttonTitle} onPress={handleClaim} />
    </View>
  );
}

const styles = StyleSheet.create({
  containeralt: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eee",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    height: 300,
    margin: "auto",
    padding: 30,
    width: 600
  },
  btnsWrap: {
    justifyContent: "space-between",
    width: '100%',
    flexDirection: 'row',
    marginTop: 20
  },
  wrapper: {
    width: '100%',
  },
  close: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#fff',
  }
});
