import React, { useEffect, useState } from "react";
import { W3Wrapper } from "../W3Wrapper";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useEthers } from "@usedapp/core";
import { getRecentClaims } from "../../sdk/claim/utils/getRecentClaims";
export interface PageProps {
  pools: Array<string>;
  account: string;
  explorers: string;
}

const Web3Component = (params: PageProps) => {
  const [claims, setClaims] = useState<any>();
  const { library } = useEthers();

  useEffect(() => {
    if (!library) return;
    void getRecentClaims(params.account, params.explorers, library, params.pools, true).then(recentClaims =>
      setClaims(recentClaims)
    );
  }, [library, params]);

  return <div>{JSON.stringify(claims)}</div>;
};
const Page = (params: PageProps) => (
  <W3Wrapper withMetaMask={true}>
    <Web3Component {...params} />
  </W3Wrapper>
);

export default {
  title: "getRecentClaims example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = args => (
  <W3Wrapper withMetaMask={true}>
    <Web3Component {...args} />
  </W3Wrapper>
);

export const getRecentClaimsExample = Template.bind({});
getRecentClaimsExample.args = {
  pools: [
    "0x0d43131f1577310d6349baf9d6da4fc1cd39764c",
    "0xDd1c12f197E6D1E2FBA15487AaAE500eF6e07BCA",
    "0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1"
  ],
  account: "0xA48840D89a761502A4a7d995c74f3864D651A87F",
  explorers: "https://celo.blockscout.com/api?,https://api.celoscan.io/api?chainid=42220&"
};
