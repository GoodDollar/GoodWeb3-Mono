import React, { useCallback } from "react";
import {
  AsyncStorage,
  useAggregatedCertificates,
  useCheckAvailableOffers,
  useFVLink,
  useIdentityExpiryDate,
  useIsAddressVerified,
  useIssueCertificates,
  useGetEnvChainId,
  useCertificatesSubject
} from "@gooddollar/web3sdk-v2";
import { useEthers } from "@usedapp/core";
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

export const SegmentationController = ({ onDone }: { onDone: SegmentationProps["onDone"] }) => {
  const { account = "" } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const issueCertificate = useIssueCertificates(account, baseEnv);
  const fvLink = useFVLink();
  const certificates = useAggregatedCertificates(account);
  const certificateSubjects = useCertificatesSubject(certificates);
  const [isWhitelisted] = useIsAddressVerified(account);
  const [expiryDate, , state] = useIdentityExpiryDate(account);
  const availableOffers = useCheckAvailableOffers({ account, pools: redtentOffer });

  const onLocationRequest = useCallback(
    async (locationState: any, account: string) => {
      // verify if we already have a certificate
      // this could occur by a user navigating back to the segmentation start screen
      const hasValidCertificates = certificates.some(cert => cert.certificate);
      if (hasValidCertificates) {
        return;
      }

      const fvSig = await AsyncStorage.getItem("fvSig").then(async sig =>
        !isEmpty(sig) ? sig : await fvLink.getFvSig()
      );
      await issueCertificate(account, locationState, fvSig);
    },
    [issueCertificate, account, certificates]
  );

  return (
    <SegmentationWizard
      onDone={onDone}
      onLocationRequest={onLocationRequest}
      account={account}
      certificateSubjects={certificateSubjects}
      isWhitelisted={isWhitelisted}
      idExpiry={{ expiryDate, state }}
      availableOffers={availableOffers}
    />
  );
};
