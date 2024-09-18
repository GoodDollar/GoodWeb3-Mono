import React, { useCallback } from "react";
import {
  AggregatedCertificate,
  AsyncStorage,
  getMemberUbiPools,
  useFVLink,
  useIssueCertificates,
  useGetEnvChainId
} from "@gooddollar/web3sdk-v2";
import { isEmpty } from "lodash";
import { ethers } from "ethers";
import usePromise from "react-use-promise";

import { SegmentationProps, SegmentationWizard } from "../wizards/SegmentationWizard";
import { Spinner } from "native-base";

export const SegmentationController = ({
  account,
  library,
  certificates,
  certificateSubjects,
  expiryFormatted,
  fvSig,
  isWhitelisted,
  withNavBar,
  isDev = false,
  onDone
}: Omit<SegmentationProps, "onLocationRequest" | "onDataPermission" | "availableOffers"> & {
  fvSig?: string;
  certificates: AggregatedCertificate[];
  library: ethers.providers.Provider;
}) => {
  const { baseEnv } = useGetEnvChainId();
  const issueCertificate = useIssueCertificates(account, baseEnv);
  const fvLink = useFVLink();
  const [memberUbiPools] = usePromise(() => getMemberUbiPools(library, account), []);

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
    await AsyncStorage.setItem("goodid_permission", accepted);
  };

  if (memberUbiPools === undefined) return <Spinner variant="page-loader" size="lg" />;

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
        memberUbiPools
      }}
    />
  );
};
