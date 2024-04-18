import React, { useCallback } from "react";
import {
  AsyncStorage,
  requestLocationCertificate,
  requestIdentityCertificate,
  useCertificates,
  useFVLink,
  useGetEnvChainId,
  LocationState
} from "@gooddollar/web3sdk-v2";
import { useEthers } from "@usedapp/core";

import { SegmentationWizard } from "../wizards/SegmentationWizard";

const useGetCertificates = (account: string | undefined) => {
  const { storeCertificate } = useCertificates(account ?? "");
  const { baseEnv } = useGetEnvChainId();
  const fvLink = useFVLink();

  const fetchCertificates = useCallback(
    async (account: string, locationState: LocationState | undefined) => {
      try {
        let fvsig = await AsyncStorage.getItem("fvSig");
        if (!fvsig) {
          fvsig = await fvLink.getFvSig();
        }

        const promises = [];

        if (locationState && locationState.location) {
          promises.push(requestLocationCertificate(baseEnv, locationState.location, fvsig, account));
        }

        promises.push(requestIdentityCertificate(baseEnv, fvsig, account));

        const results = await Promise.all(promises);

        for (const result of results) {
          if (result && result.certificate) {
            await storeCertificate(result.certificate);
          }
        }
      } catch (e) {
        console.error("Failed to get certificates:", e);
        // should trigger error modal
      }
    },
    [baseEnv, fvLink, storeCertificate]
  );

  return { fetchCertificates };
};

export const SegmentationController = () => {
  const { account } = useEthers();
  const { fetchCertificates } = useGetCertificates(account ?? "");

  const onLocationRequest = useCallback(
    async (locationState: any, account: string) => {
      await fetchCertificates(account, locationState);
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
