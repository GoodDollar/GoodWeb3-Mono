import React from "react";
import { RedtentController } from "../../../apps/redtent/RedtentController";
import { W3Wrapper } from "../../W3Wrapper";
import { getDevice } from "@gooddollar/web3sdk-v2";
console.log({ getDevice });
export default {
  title: "Apps/Redtent Video Upload S3",
  component: props => (
    <W3Wrapper withMetaMask={true} env="fuse">
      <RedtentController {...props} />
    </W3Wrapper>
  )
};

export const RedtentS3Upload = {
  args: {
    onDone: async (error: any) => {
      alert(`done controller: ${error}`);
    },
    country: "nigeria",
    account: "0x123"
  }
};
