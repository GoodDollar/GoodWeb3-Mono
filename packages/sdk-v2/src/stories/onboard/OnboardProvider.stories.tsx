import React, { useEffect, useState } from "react";
import { OnboardProvider } from "../../sdk";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { View, Text, Button } from "react-native";
import { ethers } from "ethers";

export interface PageProps {}

const Web3Component = (params: PageProps) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [{ wallet, connecting }, connect] = useConnectWallet();
  const [chains, switchChain] = useSetChain(wallet?.label);
  useEffect(() => {
    connect().then(_ => console.log("connected", _));
  }, []);

  useEffect(() => {
    if (wallet?.provider) {
      setProvider(new ethers.providers.Web3Provider(wallet.provider));
    }
  }, [wallet]);

  const sign = async () => {
    if (!provider) return;
    const signature = await provider.getSigner().signMessage("test");
    console.log("signature:", signature);
  };

  const send = async () => {
    if (!provider) return;
    const tx = await provider.getSigner().sendTransaction({ to: ethers.constants.AddressZero, value: 0 });
    console.log("tx:", tx);
  };

  const switchRequest = async () => {
    const switched = await switchChain({ chainId: "7a", chainNamespace: "evm" });
    console.log("switched:", switched);
  };

  useEffect(() => {
    const checkProvider = async () => {
      if (!provider) return;
      console.log("block:", await provider.getBlockNumber());
    };
    if (provider) checkProvider();
  }, [provider]);

  console.log({ wallet, provider });

  return (
    <View>
      <Text>Wallet: {wallet?.label}</Text>
      <Text>Wallet: {JSON.stringify(wallet?.chains || "")}</Text>
      <Button onPress={sign} title="Sign Message" />
      <Button onPress={send} title="Send TX" />
      <Button onPress={switchRequest} title="Switch Chain" />
    </View>
  );
};
const Page = (params: PageProps) => (
  <OnboardProvider>
    <Web3Component {...params} />
  </OnboardProvider>
);

export default {
  title: "OnboardProvider example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const OnboardProviderSDKExample = Template.bind({});
