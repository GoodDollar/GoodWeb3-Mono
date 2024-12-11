import React, { useCallback, useEffect, useState } from "react";
import { AsyncStorage, useSendAnalytics } from "@gooddollar/web3sdk-v2";
import { isEmpty, noop } from "lodash";
import moment from "moment";
import { IContainerProps, Spinner } from "native-base";
import { Wizard } from "react-use-wizard";

import { WizardHeader } from "../wizards";
import { OnboardScreen, OnboardScreenProps } from "../screens/OnboardScreen";
import { useFVModalAction, useGoodId } from "../../../hooks";
import { SegmentationController } from "./SegmentationController";

export interface OnboardControllerProps {
  account: string;
  withNavBar: boolean;
  name?: string | undefined;
  fvSig?: string;
  isDev?: boolean;
  isWallet?: boolean;
  onFV?: () => void;
  onSkip: () => void;
  onDone: (e?: any) => Promise<void>;
  onExit: () => void;
}

export const OnboardController = (
  props: Pick<OnboardScreenProps, "innerContainer" | "fontStyles"> & OnboardControllerProps & IContainerProps
) => {
  const { onDone, onExit, onFV, onSkip, account, name, fvSig, withNavBar, isDev = false, isWallet = false } = props;
  const { certificates, certificateSubjects, expiryDate, expiryFormatted, isWhitelisted } = useGoodId(account);

  const [isPending, setPendingSignTx] = useState(false);
  const [doingSegmentation, setDoingSegmentation] = useState(false);
  const [shouldUpgrade, setShouldUpgrade] = useState(false);

  const [tosAccepted, setTosAccepted] = useState<boolean | undefined>(undefined);

  const { track } = useSendAnalytics();

  const expiryWithin1Month = useCallback(() => {
    const { expiryTimestamp } = expiryDate ?? {};

    if (expiryTimestamp === undefined) return false;

    const expiry = moment(expiryTimestamp.toNumber());
    const oneMonthFromNow = moment().clone().add(1, "months");
    const shouldDoFV = isWhitelisted === false || expiry.isBefore(oneMonthFromNow);
    return shouldDoFV;
  }, [expiryDate, isWhitelisted]);

  useEffect(() => {
    // segmentation flow
    if (isEmpty(certificates) || expiryDate === undefined) return;

    const shouldFv = expiryWithin1Month();

    if (shouldFv) {
      setShouldUpgrade(true);
      return;
    }

    const hasValidCertificates = certificates.some(cert => cert.certificate);

    if (hasValidCertificates && !doingSegmentation) {
      onSkip();
      return;
    } else {
      // because of the reactivity of the certificates query,
      // we need to prevent onSkip being triggered during segmentation flow
      setDoingSegmentation(true);
    }

    void (async () => {
      const accepted = await AsyncStorage.getItem("tos-accepted");
      await AsyncStorage.setItem("goodid_permission", "false");
      setTosAccepted(accepted);
    })();
  }, [certificates, expiryDate, doingSegmentation]);

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

  const onCompleted = useCallback(
    async (error?: Error | boolean) => {
      track("goodid_success");
      void onDone(error);
    },
    [onDone]
  );

  const handleShouldFV = useCallback(async () => {
    try {
      track("goodid_start");
      await AsyncStorage.setItem("tos-accepted", true);
      const { expiryTimestamp } = expiryDate ?? {};

      // if someone is whitelisted we want to verify their timestamp
      // to determine if they should re-do the fv-flow
      if (isWhitelisted !== undefined && expiryTimestamp !== undefined) {
        const shouldDoFV = expiryWithin1Month();
        // if the expiry date is within 1 month, we should re-do the fv-flow
        if (shouldDoFV) {
          void doFV();
        } else {
          setTosAccepted(true);
        }
      }
    } catch (e: any) {
      track("goodid_error", { error: "handleShouldFv failed", message: e?.message, e });
      console.error(e);
      throw new Error(e);
    }
  }, [doFV, isWhitelisted, expiryDate]);

  if (isEmpty(certificates) || isWhitelisted === undefined || tosAccepted === undefined)
    return <Spinner variant="page-loader" size="lg" />;

  if (isWhitelisted === true && tosAccepted && !shouldUpgrade)
    return (
      <SegmentationController
        {...{
          account,
          certificates,
          certificateSubjects,
          expiryFormatted,
          fvSig,
          isWhitelisted,
          onDone: onCompleted,
          withNavBar,
          isDev,
          isWallet
        }}
      />
    );

  return (
    <Wizard header={<WizardHeader onExit={onExit} withNavBar={props.withNavBar} onDone={onDone} error={undefined} />}>
      <OnboardScreen
        {...{
          ...props,
          name,
          isPending,
          isWhitelisted,
          certificateSubjects,
          expiryDate: expiryFormatted,
          onAccept: handleShouldFV,
          paddingBottom: 8
        }}
      />
    </Wizard>
  );
};
