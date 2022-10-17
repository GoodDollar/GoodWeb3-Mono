import React, { useEffect, useCallback, useState } from "react";
import { Web3ActionButton } from "../advanced/web3action";
import { Mainnet, DAppProvider, Config, Goerli, useEthers } from "@usedapp/core";
import { useClaim, Fuse, Celo, Web3Provider } from "@gooddollar/web3sdk-v2";
import { getDefaultProvider, ethers } from "ethers";
import { ExternalProvider } from "@ethersproject/providers";

const config: Config = {
  networks: [Mainnet, Fuse, Celo, Goerli],
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider("https://mainnet.infura.io/v3/12207372b62941dfb1efd4fe26b95ccc"),
    [Goerli.chainId]: getDefaultProvider("https://goerli.infura.io/v3/12207372b62941dfb1efd4fe26b95ccc"),
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org"
  }
};

export const W3Wrapper = () => {
  const ethereum = (window as any).ethereum;
  const { account } = useEthers();
  const [provider, setProvider] = useState(new ethers.providers.JsonRpcProvider("https://rpc.fuse.io", "any"));
  const [accountFound, setAccountFound] = useState(false);

  useEffect(() => {
    if (!account && !accountFound) {
      setAccountFound(true);
      ethereum.request({ method: "eth_requestAccounts" }).then((r: Array<string>) => {
        if (r.length > 0) {
          setProvider(new ethers.providers.Web3Provider(ethereum as ExternalProvider, "any"));
        }
      });
    }
  });

  //todo: should not need two providers, current bug with only web3provider and not able to find connected account

  return (
    <DAppProvider config={config}>
      <Web3Provider env={"fuse"} web3Provider={provider} config={config}>
        <Web3Action />
      </Web3Provider>
    </DAppProvider>
  );
};

const Web3Action = () => {
  const { account, chainId } = useEthers();
  //TODO: useClaim is run with RO provider address / probably cause of the two DappProviders used
  const { isWhitelisted, claimAmount, claimTime, claimCall } = useClaim("everyBlock");
  const [claimText, setClaimText] = useState<string>("Claim UBI");

  useEffect(() => {
    // console.log("web3action -- account -->", { account, isWhitelisted });
  }, [account, chainId]);

  const handleClaim = useCallback(async () => {
    // console.log("HC isWhitelisted -->", { isWhitelisted });
    if (isWhitelisted) {
      // console.log("isWhitelisted");
      await claimCall.send();
    }
  }, [account, chainId, isWhitelisted, claimCall]);

  useEffect(() => {
    if (claimAmount) {
      const amount = parseInt(claimAmount.toString());
      setClaimText(`Claim ${amount}`);
    }
  }, [claimAmount]);

  return <Web3ActionButton text={claimText} requiredChain={122} web3Action={handleClaim} />;
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
