import React, { useCallback } from "react";
import {
  AsyncStorage,
  useAggregatedCertificates,
  useFVLink,
  useGetCertificates,
  useGetEnvChainId
} from "@gooddollar/web3sdk-v2";
import { useEthers } from "@usedapp/core";

import { SegmentationWizard } from "../wizards/SegmentationWizard";

export const SegmentationController = () => {
  const { account } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const { fetchCertificates } = useGetCertificates(account ?? "", baseEnv);
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
      let fvSig = await AsyncStorage.getItem("fvSig");
      if (!fvSig) {
        fvSig = await fvLink.getFvSig();
      }
      await fetchCertificates(account, locationState, fvSig);
    },
    [fetchCertificates, account]
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
