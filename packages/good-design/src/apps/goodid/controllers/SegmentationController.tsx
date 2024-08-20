import React, { useCallback } from "react";
import {
  AsyncStorage,
  useCheckAvailableOffers,
  useFVLink,
  useIssueCertificates,
  useGetEnvChainId,
  AggregatedCertificate
} from "@gooddollar/web3sdk-v2";
import { isEmpty } from "lodash";

import { SegmentationProps, SegmentationWizard } from "../wizards/SegmentationWizard";

const redtentOffer = [
  {
    campaign: "RedTent",
    Location: {
      countryCode: "NG"
    },
    Gender: "Female"
  },
  {
    campaign: "RedTent",
    Location: {
      countryCode: "CO"
    },
    Gender: "Female"
  }
  // {
  //   campaign: "RedTent",
  //   Location: {
  //     countryCode: "PH" // not confirmed yet
  //   },
  //   Gender: "Female"
  // }
];

export const SegmentationController = ({
  account,
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
}) => {
  const { baseEnv } = useGetEnvChainId();
  const issueCertificate = useIssueCertificates(account, baseEnv);
  const fvLink = useFVLink();
  const availableOffers = useCheckAvailableOffers({ account, pools: redtentOffer, isDev });

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

  return (
    <SegmentationWizard
      {...{
        onDone,
        onLocationRequest,
        account,
        certificateSubjects,
        expiryFormatted,
        isWhitelisted,
        availableOffers,
        onDataPermission,
        withNavBar
      }}
    />
  );
};
