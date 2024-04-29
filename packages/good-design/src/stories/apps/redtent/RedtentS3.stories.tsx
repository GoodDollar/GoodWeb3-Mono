import React from "react";
import { RedtentController } from "../../../apps/goodid/controllers/RedtentController";
import { W3Wrapper } from "../../W3Wrapper";

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
