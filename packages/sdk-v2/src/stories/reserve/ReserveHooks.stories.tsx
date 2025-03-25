import React, { useEffect, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";

import { useExchangeId, useG$Price, useSwapMeta, useSwap } from "../../sdk/reserve/react";
import { W3Wrapper } from "../W3Wrapper";

export interface PageProps {
  inputToken: string;
  outputToken: string;
  input: number;
  minAmountOut: number;
}

const Web3Component = (props: PageProps) => {
  const { account = "0x" } = useEthers();
  const [swapError, setError] = useState(undefined);

  const price = useG$Price();
  const buyingMeta = useSwapMeta(account, true, 0.1, ethers.utils.parseEther("1000"), undefined);
  const sellingMeta = useSwapMeta(account, false, 0.1, ethers.utils.parseEther("1000"), undefined);
  const exchangeId = useExchangeId();
  const swap = useSwap(
    props.inputToken || "0xeed145D8d962146AFc568E9579948576f63D5Dc2",
    props.outputToken || "0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475",
    {
      input: ethers.utils.parseEther(String(props.input)).toString(),
      minAmountOut: ethers.utils.parseEther(String(props.minAmountOut)).toString()
    }
  );

  useEffect(() => {
    const { state } = swap.swap;

    if (state.status === "Exception") {
      setError(state.errorMessage);
    }
  }, [swap]);

  return (
    <>
      <div>
        <h3>G$ Price: {price?.toString()}</h3>
      </div>
      <div>
        <h3>exchangeId: {exchangeId}</h3>
      </div>
      <div style={{ flexDirection: "row", display: "flex" }}>
        <div>
          <h3>
            Buying Meta
            <pre>{JSON.stringify(buyingMeta, null, 2)}</pre>
          </h3>
        </div>
        <div>
          <h3>
            Selling Meta:
            <pre>{JSON.stringify(sellingMeta, null, 2)}</pre>
          </h3>
        </div>
      </div>
      <div>
        {swapError ? (
          <div>
            <h3>Swap Error</h3>
            <pre>{swapError}</pre>
          </div>
        ) : null}
        <button
          onClick={async () => {
            const tx = await swap.swap.send();
            console.log(tx);
          }}
        >
          Swap
        </button>
        <button
          onClick={async () => {
            const tx = await swap.approve.send(ethers.utils.parseEther(String(props.input)).toString());
            console.log(tx);
          }}
        >
          Approve
        </button>
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
  component: Page,
  args: {
    inputToken: "0xeed145D8d962146AFc568E9579948576f63D5Dc2",
    outputToken: "0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475",
    input: 1000,
    minAmountOut: 0
  }
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = args => (
  <W3Wrapper withMetaMask={true}>
    <Web3Component {...args} />
  </W3Wrapper>
);

export const ReserveSDKExample = Template.bind({});
