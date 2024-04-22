import React, { useCallback } from "react";
import {
  AsyncStorage,
  useAggregatedCertificates,
  useFVLink,
  useIssueCertificates,
  useGetEnvChainId
} from "@gooddollar/web3sdk-v2";
import { useEthers } from "@usedapp/core";

import { SegmentationWizard } from "../wizards/SegmentationWizard";

export const SegmentationController = () => {
  const { account } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const { issueCertificate } = useIssueCertificates(account ?? "", baseEnv);
  const fvLink = useFVLink();
  const certificates = useAggregatedCertificates(account ?? "");

  const onLocationRequest = useCallback(
    async (locationState: any, account: string) => {
      // verify if we already have a certificate
      // this could occur by a user navigating back to the segmentation start screen
      const hasValidCertificates = certificates.some(cert => cert.certificate);
      if (hasValidCertificates) {
        return;
      }
      const fvSig = await AsyncStorage.getItem("fvSig").then(async sig => sig ?? (await fvLink.getFvSig()));
      await issueCertificate(account, locationState, fvSig);
    },
    [issueCertificate, account]
  );

  // Handle the completion of the wizard
  const onDone = async () => {
    try {
      console.log("Segmentation details processed successfully.");
    } catch (error) {
      console.error("Failed to process segmentation details:", error);
    }
  };

  return <SegmentationWizard onDone={onDone} onLocationRequest={onLocationRequest} />;
};
