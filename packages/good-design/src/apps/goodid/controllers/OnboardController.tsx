import React, { useCallback, useEffect, useState } from "react";
import { OnboardScreen, OnboardScreenProps } from "../screens/OnboardScreen";
import { AsyncStorage, useIdentityExpiryDate, useIsAddressVerified } from "@gooddollar/web3sdk-v2";
import { useFVModalAction } from "../../../hooks/useFVModalAction";
import { noop } from "lodash";
import moment from "moment";

export interface OnboardControllerProps {
  account: string | undefined;
  name?: string | undefined;
  onFV?: () => void;
  onSkip: () => void;
}

export const OnboardController = (
  props: Pick<OnboardScreenProps, "innerContainer" | "fontStyles"> & OnboardControllerProps
) => {
  const { onFV, onSkip, account, name } = props;
  const [hasCertificates] = useState(false);
  const [isWhitelisted] = useIsAddressVerified(account ?? "");
  const [expiryDate] = useIdentityExpiryDate(account ?? "");
  const [isPending, setPendingSignTx] = useState(false);

  useEffect(() => {
    if (hasCertificates === true) {
      onSkip();
    }
  }, [hasCertificates]);

  const storeFvSig = async (fvSig: string) => {
    // the link will be requested to send a user to the fv-flow
    // we want to prevent a user to have to sign again when it redirects
    // so we store the fv-sig locally
    await AsyncStorage.setItem("fvsig", fvSig);
  };

  const { verify } = useFVModalAction({
    firstName: name ?? "",
    method: "redirect",
    chainId: 42220,
    onClose: noop,
    onFvSig: storeFvSig
  });

  const doFV = async () => {
    // Should go to FaceVerificationIntro (wallet) || GoodID server (third parties)
    if (onFV) {
      onFV();
    } else {
      setPendingSignTx(true);
      await verify();
    }
  };

  const handleShouldFV = useCallback(async () => {
    const { expiryTimestamp } = expiryDate || {};

    // if someone is whitelisted we want to verify their timestamp
    // to determine if they should re-do the fv-flow
    if (isWhitelisted !== undefined && expiryTimestamp !== undefined) {
      const expiry = moment(expiryTimestamp.toNumber());
      const threeMonthsFromNow = moment().clone().add(3, "months");
      const shouldDoFV = isWhitelisted === false || expiry.isBefore(threeMonthsFromNow);

      // if the expiry date is within 3 months, we should re-do the fv-flow
      if (shouldDoFV) {
        void doFV();
      } else {
        console.log("continue to segmentation here:");
        // if the expiry date is not within 3 months we will use their existing fv data
        // to run the good-id checks
        //todo: Need solution for widget-navigation (gooddapp): https://github.com/GoodDollar/GoodWeb3-Mono/issues/131
        // nextPage() <-- should navigate to segmentation screen
      }
    }
  }, [doFV, isWhitelisted, expiryDate]);

  return (
    <OnboardScreen
      {...{
        ...props,
        name,
        isPending,
        isWhitelisted,
        hasCertificates,
        expiryDate: expiryDate?.formattedExpiryTimestamp,
        onAccept: handleShouldFV
      }}
    ></OnboardScreen>
  );
};
