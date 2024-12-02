import React from "react";
import { uploadToS3, useAggregatedCertificates, useRegisterRedtent } from "@gooddollar/web3sdk-v2";

import { RedtentWizard } from "../wizards/RedtentWizard";
import { RedTentProps } from "../types";
import uuid from "uuid";

export const RedtentController = (props: Omit<RedTentProps, "onVideo"> & { account: string }) => {
  const registerRedtent = useRegisterRedtent();
  const { account } = props;
  const certificatesList = useAggregatedCertificates(account);
  const certificates = certificatesList
    .filter(cert => cert.typeName === "Location" || cert.typeName === "Identity")
    .map(_ => _.certificate);

  const onVideo: RedTentProps["onVideo"] = async (base64, extension) => {
    if (base64) {
      const videoFilename = `${uuid.v4()}.${extension}`;
      const s3res = await uploadToS3(base64, videoFilename);
      const registerRes = await registerRedtent({ videoFilename, certificates });
      console.log(s3res, registerRes);
    }
  };
  return <RedtentWizard {...props} onVideo={onVideo}></RedtentWizard>;
};
