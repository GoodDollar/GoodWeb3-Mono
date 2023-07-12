import React from "react";
import { Onramper } from "../../../apps/onramp/Onramper";

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
    <div style={{ height: "600px" }}>
      <Onramper
        onSuccess={() => {
          console.log("success");
        }}
        {...props}
      />
    </div>
  )
};
