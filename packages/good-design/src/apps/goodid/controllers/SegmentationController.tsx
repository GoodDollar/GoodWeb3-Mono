import React, { useCallback } from "react";
import {
  AsyncStorage,
  useFVLink,
  useIssueCertificates,
  useGetEnvChainId,
  AggregatedCertificate,
  useSendAnalytics
} from "@gooddollar/web3sdk-v2";
import { isEmpty } from "lodash";

import { SegmentationProps, SegmentationWizard } from "../wizards/SegmentationWizard";

export const SegmentationController = ({
  account,
  certificates,
  certificateSubjects,
  expiryFormatted,
  fvSig,
  isWhitelisted,
  withNavBar,
  isDev = false,
  isWallet = false,
  onDone
}: Omit<SegmentationProps, "onLocationRequest" | "onDataPermission" | "availableOffers"> & {
  fvSig?: string;
  certificates: AggregatedCertificate[];
}) => {
  const { baseEnv } = useGetEnvChainId();
  const issueCertificate = useIssueCertificates(account, baseEnv);
  const fvLink = useFVLink();
  const { track } = useSendAnalytics();

  const onLocationRequest = useCallback(
    async (locationState: any, account: string) => {
      // verify if we already have a certificate
      // this could occur by a user navigating back to the segmentation start screen
      const hasValidCertificates = certificates.some(cert => cert.certificate);
      if (hasValidCertificates) {
        return;
      }
      fvSig =
        fvSig ||
        (await AsyncStorage.getItem("fvSig").then(async sig => (!isEmpty(sig) ? sig : await fvLink.getFvSig())));
      if (fvSig) await issueCertificate(account, locationState, fvSig);
      else {
        throw new Error("missing faceid");
      }
    },
    [issueCertificate, account, certificates]
  );

  const onDataPermission = async (accepted: string) => {
    const event = accepted === "true" ? "goodid_agree_receive_offer" : "goodid_decline_receive_offer";
    track(event);
    await AsyncStorage.setItem("goodid_permission", accepted);
  };

  return (
    <SegmentationWizard
      {...{
        onDone,
        onLocationRequest,
        account,
        certificateSubjects,
        expiryFormatted,
        isWhitelisted,
        onDataPermission,
        withNavBar,
        isDev,
        isWallet
      }}
    />
  );
};
