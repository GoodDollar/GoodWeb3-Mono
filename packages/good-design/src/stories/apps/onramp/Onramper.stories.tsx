import React from "react";
import { noop } from "lodash";

import { GdOnramperWidget } from "../../../apps/onramp/GdOnramperWidget";
import { W3Wrapper } from "../../W3Wrapper";

export const OnramperWidget = {
  args: {
    step: 0,
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
        <GdOnramperWidget isTesting={true} onEvents={noop} {...props} />
      </div>
    </W3Wrapper>
  )
};
