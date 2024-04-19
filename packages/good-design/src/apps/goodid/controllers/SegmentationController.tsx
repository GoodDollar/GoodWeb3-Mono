import React, { useCallback } from "react";
import { AsyncStorage, useFVLink, useGetCertificates, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { useEthers } from "@usedapp/core";

import { SegmentationWizard } from "../wizards/SegmentationWizard";

export const SegmentationController = () => {
  const { account } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const { fetchCertificates } = useGetCertificates(account ?? "", baseEnv);
  const fvLink = useFVLink();

  const onLocationRequest = useCallback(
    async (locationState: any, account: string) => {
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
