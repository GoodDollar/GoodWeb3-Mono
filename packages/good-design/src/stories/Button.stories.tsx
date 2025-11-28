import { ExternalProvider } from "@ethersproject/providers";
import { Celo, Fuse, Xdc, Web3Provider } from "@gooddollar/web3sdk-v2";
import { Config, DAppProvider, Mainnet, useEthers } from "@usedapp/core";
import { ethers, getDefaultProvider } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import BaseButton from "../core/buttons/BaseButton";
import GoodButton from "../core/buttons/GoodButton";
import ClaimButton from "../core/buttons/ClaimButton";
import LearnButton from "../core/buttons/LearnButton";
import { BasePressable } from "../core/buttons";
import { TxModal } from "../core/web3/modals";

import { useGoodUILanguage } from "../theme";
import { VStack } from "native-base";

export const BaseButtonWithThemeExample = () => {
  return (
    <>
      <BaseButton
        width="250px"
        onPress={() => {
          console.log("clicked");
        }}
        text="RegularBB with default NB Theming"
      />
    </>
  );
};

const LinguiExample = () => {
  const { setLanguage } = useGoodUILanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setModalOpen(prev => !prev);
  }, []);

  return (
    <VStack width="343">
      <TxModal type="sign" isPending={modalOpen} />
      <GoodButton width="200" onPress={() => setLanguage("en")} backgroundColor="gdPrimary" color="white">
        English
      </GoodButton>
      <GoodButton width="200" onPress={() => setLanguage("es-419")} backgroundColor="gdPrimary" color="white">
        Spanish-Latin
      </GoodButton>
      <LearnButton type="network" />
      <GoodButton width="200" onPress={openModal}>
        Open Modal
      </GoodButton>
    </VStack>
  );
};

export const LearnButtonWithTranslation = () => <LinguiExample />;

const config: Config = {
  networks: [Mainnet, Fuse, Celo, Xdc],
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider("https://mainnet.infura.io/v3/12207372b62941dfb1efd4fe26b95ccc"),
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org"
  }
};

export const BasePressableWithStates = () => (
  <BasePressable
    text={"Testing"}
    viewInteraction={{ hover: { backgroundColor: "gdPrimary" } }}
    textInteraction={{ hover: { color: "white" } }}
  />
);

export const ClaimButtonWithThemeExample = () => {
  const ethereum = (window as any).ethereum;
  const { account, library } = useEthers();
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
  }, [/* used */ library]);

  //todo: should not need two providers, current bug with only web3provider and not able to find connected account
  // probably causing the claimCall bug where it doesn't update to web3provider
  return (
    <DAppProvider config={config}>
      <Web3Provider env="fuse" web3Provider={provider} config={config}>
        <ClaimButton firstName="Test2" method="popup" claim={async () => false} />
      </Web3Provider>
    </DAppProvider>
  );
};

export default {
  title: "Core/Basic",
  component: BaseButton,
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

export const Basic = {
  args: {
    text: "Hello World",
    colorScheme: "gdPrimary",
    size: "md"
  }
};
