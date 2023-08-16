import * as React from "react";
import { useEffect } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Web3ModalProvider, useWeb3Modal, useDisconnect } from "../../contexts/web3modal/Web3modalProvider";
import { View, Text, Button } from "react-native";
import { ethers } from "ethers";
import { useEthers, useSigner } from "@usedapp/core";
import { useSwitchNetwork } from "../../contexts";

const Web3Component = () => {
  const { account, library, chainId } = useEthers();
  const signer = useSigner();
  const modal = useWeb3Modal();
  const switchNetwork = useSwitchNetwork();
  const disconnect = useDisconnect();

  useEffect(() => {
    modal
      .open()
      .then(_ => console.log("connected", _))
      .catch(e => {
        console.log(e);
      });
  }, []);

  const sign = async () => {
    if (!signer) return;
    const signature = await signer.signMessage("text");
    console.log("signature:", signature);
  };

  const send = async () => {
    if (!signer) return;
    const tx = await signer.sendTransaction({ to: ethers.constants.AddressZero, value: 0 });
    console.log("tx:", tx);
  };

  const switchRequest = async () => {
    const switched = await switchNetwork.switchNetwork(chainId === 1 ? 42220 : 1);
    console.log("switched:", switched);
  };

  useEffect(() => {
    const checkProvider = async () => {
      if (!library) return;
      console.log("block:", await library.getBlockNumber());
    };
    if (library)
      checkProvider().catch(e => {
        console.log(e);
      });
  }, [library]);

  console.log({ library });

  return (
    <View>
      <Text>Wallet: {account}</Text>
      <Text>Wallet: {chainId}</Text>
      <Button onPress={sign} title="Sign Message" />
      <Button onPress={send} title="Send TX" />
      <Button onPress={switchRequest} title="Switch Chain" />
      <Button onPress={() => disconnect.disconnect()} title="Disconnect" />
      <Button onPress={modal.open} title="Open" />
    </View>
  );
};
const Page = () => (
  <Web3ModalProvider>
    <Web3Component />
  </Web3ModalProvider>
);

export default {
  title: "Web3ModalProvider example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const Web3ModalProviderExample = Template.bind({});
