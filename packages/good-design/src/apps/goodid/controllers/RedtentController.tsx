import React from "react";
import { RedtentWizard, RedTentProps } from "../wizards/RedtentWizard";
import { uploadToS3, useRegisterRedtent } from "@gooddollar/web3sdk-v2";

export const RedtentController = (
  props: Omit<RedTentProps, "onVideo"> & { account: string; credentials: Array<any> }
) => {
  const registerRedtent = useRegisterRedtent();
  const { account, credentials } = props;
  const onVideo: RedTentProps["onVideo"] = async (base64, extension) => {
    if (base64) {
      const videoFilename = `${props.account}.${extension}`;
      const s3res = await uploadToS3(base64, videoFilename);
      const registerRes = await registerRedtent({ account, credentials, videoFilename });
      console.log(s3res, registerRes);
    }
  };
  return <RedtentWizard {...props} onVideo={onVideo}></RedtentWizard>;
};