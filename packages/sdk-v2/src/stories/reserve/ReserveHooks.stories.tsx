import React from "react";
import { W3Wrapper } from "../W3Wrapper";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useExchangeId, useG$Price, useSwapMeta } from "../../sdk/reserve/react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";

export interface PageProps {
  address?: string;
  firstName?: string;
}

const Web3Component = () => {
  const price = useG$Price();
  const { account = "0x" } = useEthers();
  const buyingMeta = useSwapMeta(account, true, 0.1, ethers.utils.parseEther("1000"), undefined);
  const sellingMeta = useSwapMeta(account, false, 0.1, ethers.utils.parseEther("1000"), undefined);
  const exchangeId = useExchangeId();
  return (
    <>
      <div>
        <h3>{price?.toString()}</h3>
      </div>
      <div>
        <h3>exchangeId: {exchangeId}</h3>
      </div>
      <div>
        <h3>
          <pre>{JSON.stringify(buyingMeta)}</pre>
        </h3>
      </div>
      <div>
        <h3>
          <pre>{JSON.stringify(sellingMeta)}</pre>
        </h3>
      </div>
    </>
  );
};
const Page = (params: PageProps) => (
  <W3Wrapper withMetaMask={true}>
    <Web3Component {...params} />
  </W3Wrapper>
);

export default {
  title: "Reserve SDK hooks example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = args => (
  <W3Wrapper withMetaMask={true}>
    <Web3Component {...args} />
  </W3Wrapper>
);

export const ReserveSDKExample = Template.bind({});
