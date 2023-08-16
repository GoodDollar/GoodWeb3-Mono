import React from "react";
import { OnramperController } from "../../../apps/onramp/OnramperController";
import { W3Wrapper } from "../../W3Wrapper";

export const OnramperWidget = {
  args: {
    step: -1,
    widgetParams: undefined,
    targetWallet: "0x0",
    targetNetwork: "CELO"
  }
};

export default {
  title: "Apps/Onramper",
  component: props => (
    <W3Wrapper withMetaMask={true} env="fuse">
      <div style={{ height: "600px" }}>
        <OnramperController />
      </div>
    </W3Wrapper>
  )
};
