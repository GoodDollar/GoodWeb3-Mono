import React, { useCallback, useEffect, useState } from "react";
import {
  AsyncStorage,
  useAggregatedCertificates,
  useCertificatesSubject,
  useIdentityExpiryDate,
  useIsAddressVerified
} from "@gooddollar/web3sdk-v2";
import { isEmpty, noop } from "lodash";
import moment from "moment";
import { IContainerProps, Spinner } from "native-base";

import { OnboardScreen, OnboardScreenProps } from "../screens/OnboardScreen";
import { useFVModalAction } from "../../../hooks/useFVModalAction";
import { SegmentationController } from "./SegmentationController";

export interface OnboardControllerProps {
  account: string;
  name?: string | undefined;
  fvSig?: string;
  onFV?: () => void;
  onSkip: () => void;
  onDone: (e?: any) => Promise<void>;
}

export const OnboardController = (
  props: Pick<OnboardScreenProps, "innerContainer" | "fontStyles"> & OnboardControllerProps & IContainerProps
) => {
  const { onFV, onSkip, onDone, account, name, fvSig } = props;
  const [isWhitelisted] = useIsAddressVerified(account ?? "");
  const [expiryDate] = useIdentityExpiryDate(account ?? "");
  const certificates = useAggregatedCertificates(account);
  const certificateSubjects = useCertificatesSubject(certificates);

  const [isPending, setPendingSignTx] = useState(false);
  const [accepedTos, setAcceptedTos] = useState(false);
  const [alreadyChecked, setAlreadyChecked] = useState(false);

  useEffect(() => {
    if (isEmpty(certificates)) return;
    const hasValidCertificates = certificates.some(cert => cert.certificate);
    //todo: add check from server: https://github.com/GoodDollar/GoodServer/issues/470
    if (hasValidCertificates && !alreadyChecked) {
      onSkip();
      return;
    } else {
      // because of the reactivity of the certificates query,
      // we need to prevent onSkip being triggered during segmentation flow
      setAlreadyChecked(true);
    }

    void (async () => {
      const accepted = await AsyncStorage.getItem("tos-accepted");
      setAcceptedTos(accepted);
    })();
  }, [certificates]);

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
    try {
      if (onFV) {
        onFV();
      } else {
        setPendingSignTx(true);
        await verify();
      }
    } catch (e) {
      setPendingSignTx(false);
      await AsyncStorage.removeItem("tos-accepted");
    }
  };

  const handleShouldFV = useCallback(async () => {
    await AsyncStorage.setItem("tos-accepted", true);
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
        setAcceptedTos(true);
      }
    }
  }, [doFV, isWhitelisted, expiryDate]);

  if (isEmpty(certificates)) return <Spinner variant="page-loader" size="lg" />;

  if (accepedTos) return <SegmentationController onDone={onDone} fvSig={fvSig} />;

  return (
    <OnboardScreen
      {...{
        ...props,
        name,
        isPending,
        isWhitelisted,
        certificateSubjects,
        expiryDate: expiryDate?.formattedExpiryTimestamp,
        onAccept: handleShouldFV
      }}
    />
  );
};
