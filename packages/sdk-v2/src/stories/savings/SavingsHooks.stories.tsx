import React, { useState } from "react";
import { W3Wrapper } from "../W3Wrapper";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useSavingsBalance, useSavingsStats } from "../../sdk/savings/react";
import { useEthers } from "@usedapp/core";

export interface PageProps {
  address?: string;
  firstName?: string;
}

const Web3Component = (params: PageProps) => {
  const stats = useSavingsStats(122);
  const accountStats = useSavingsBalance("never", 122);
  return (
    <div>
      <pre>
        {Object.entries(stats?.stats || {}).map(_ => (
          <div>
            {_[0]}: {JSON.stringify(_[1])}
          </div>
        ))}
      </pre>
      <pre>
        {Object.entries(accountStats || {}).map(_ => (
          <div>
            {_[0]}: {JSON.stringify(_[1])}
          </div>
        ))}
      </pre>
    </div>
  );
};
const Page = (params: PageProps) => (
  <W3Wrapper withMetaMask={true}>
    <Web3Component {...params} />
  </W3Wrapper>
);

export default {
  title: "Savings SDK hooks example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = args => (
  <W3Wrapper withMetaMask={true}>
    <Web3Component {...args} />
  </W3Wrapper>
);

export const SavingsSDKExample = Template.bind({});
