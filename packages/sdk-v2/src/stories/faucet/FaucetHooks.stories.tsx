import React from "react";
import { W3Wrapper } from "../W3Wrapper";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useEthers, useSendTransaction } from "@usedapp/core";
import { useFaucet } from "../../sdk/faucet/react";

export interface PageProps {
  address?: string;
  firstName?: string;
}

const Web3Component = () => {
  const { account } = useEthers();

  const send = useSendTransaction({ transactionName: "x" });
  const onSend = async () => {
    const res = await send.sendTransaction({ to: account, value: 0 });
    console.log({ res });
  };
  void useFaucet();
  return <div onClick={onSend}>Send test tx</div>;
};
const Page = () => (
  <W3Wrapper withMetaMask>
    <Web3Component />
  </W3Wrapper>
);

export default {
  title: "Faucet SDK hooks example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = args => (
  <W3Wrapper withMetaMask>
    <Web3Component {...args} />
  </W3Wrapper>
);

export const FaucetSDKExample = Template.bind({});
