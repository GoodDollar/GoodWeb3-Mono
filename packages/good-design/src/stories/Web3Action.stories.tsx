import React, { useEffect } from "react";
import { Web3ActionButton } from "../advanced/web3action";
import { Mainnet, DAppProvider, Config, Goerli } from "@usedapp/core";
import { useClaim, Fuse, Celo } from "@gooddollar/web3sdk-v2";
import { getDefaultProvider } from "ethers";

const exampleAction = () => {
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim(10);
  console.log({ isWhitelisted, claimAmount, claimTime, claimCall });

  const handleClaim = async () => {
    if (isWhitelisted) {
      return await claimCall.send();
    }
  };

  return handleClaim();
};

const config: Config = {
  networks: [Goerli, Mainnet, Fuse, Celo],
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider("mainnet"),
    [Goerli.chainId]: getDefaultProvider("goerli"),
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org"
  }
};

export const W3Wrapper = () => {
  return (
    <DAppProvider config={config}>
      <Web3ActionButton text={"Claim UBI"} requiredChain={122} doAction={exampleAction} />
    </DAppProvider>
  );
};

export default {
  title: "Advanced/Web3Action",
  component: W3Wrapper,
  argTypes: {
    onPress: {
      action: "clicked",
      description: "The function to call when the button is pressed"
    },
    colorScheme: {
      control: {
        type: "inline-radio",
        options: ["primary", "secondary", "success", "danger", "warning", "info"]
      }
    },
    size: {
      control: {
        type: "inline-radio",
        options: ["sm", "md", "lg"]
      }
    }
  }
};

export const WebActionButton = {
  args: {
    text: "Hello Worlds",
    colorScheme: "primary",
    size: "md"
  }
};
