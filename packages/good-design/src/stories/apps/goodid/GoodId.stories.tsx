import React from "react";
import { useEthers } from "@usedapp/core";
import { GoodIdContextProvider } from "@gooddollar/web3sdk-v2";

import { GoodIdCard } from "../../../apps/goodid";
import { OnboardScreen } from "../../../apps/goodid/screens";

import { W3Wrapper } from "../../W3Wrapper";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

//todo: add expiration date utilty example
export const GoodIdCardExample = () => {
  const { account } = useEthers();
  return (
    <GoodIdCard
      account={account ?? "0x000...0000"}
      isWhitelisted={false}
      fullname="Just a name"
      expiryDate="Expires on April 12, 2023"
    />
  );
};

export const OnboardScreenExample = () => {
  const { account } = useEthers();
  return <OnboardScreen account={account} />;
};

export default {
  title: "Apps/GoodId",
  component: GoodIdCardExample,
  decorators: [
    (Story: any) => (
      <GoodIdWrapper>
        <W3Wrapper withMetaMask={true} env="fuse">
          <Story />
        </W3Wrapper>
      </GoodIdWrapper>
    )
  ],
  argTypes: {}
};
