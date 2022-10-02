import React, { useState } from "react";
import { W3Wrapper } from "../W3Wrapper";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useSavingsStats } from "../../sdk/savings/react";
import { useNetwork } from "@usedapp/core";

export interface PageProps {
  address?: string;
  firstName?: string;
}

const Web3Component = (params: PageProps) => {
  const [fvVerificatoinLink, setLink] = useState<string>();
  const stats = useSavingsStats(1);
  const { network } = useNetwork();
  console.log({ network });
  return (
    <div>
      <div>{JSON.stringify(stats.stats)}</div>
    </div>
  );
};
const Page = (params: PageProps) => (
  <W3Wrapper>
    <Web3Component {...params} />
  </W3Wrapper>
);

export default {
  title: "Savings SDK hooks example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = args => (
  <W3Wrapper>
    <Web3Component {...args} />
  </W3Wrapper>
);

export const IdentitySDKExample = Template.bind({});
IdentitySDKExample.args = {
  address: "",
  firstName: "Hadar"
};
