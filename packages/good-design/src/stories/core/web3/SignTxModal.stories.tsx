import React, { useCallback, useEffect, useState } from "react";
import { SignTxModal } from "../../../core";
import { W3Wrapper } from "../../W3Wrapper";
import BaseButton from "../../../core/buttons/BaseButton";
import { Box, Button, VStack, Center } from "native-base";
import { useNotifications, useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import useTestContractFunction from "../../hooks/useTestContractFunction";

const SignTxModalExample = () => {
  const { notifications } = useNotifications();
  const [signer, setSigner] = useState<undefined | JsonRpcSigner>(undefined);
  const { send, transferState } = useTestContractFunction({ signer });
  const { activateBrowserWallet, library, account } = useEthers();
  const [connected, setConnected] = useState<boolean>(false);

  const connect = useCallback(async () => {
    await (activateBrowserWallet as any)();
    setConnected(true);
  }, []);

  useEffect(() => {
    if (library && !signer && account) {
      console.log("library -->", { library, account });
      const signer = (library as ethers.providers.JsonRpcProvider)?.getSigner();
      console.log("signer set -->", { addr: signer.getAddress() });
      setSigner(signer);
    }
  }, [library, connected]);

  useEffect(() => {
    console.log("signer -->", { signer });
  }, [signer]);

  const sign = useCallback(async () => {
    if (signer) {
      const signedMessage = await signer.signMessage("Test");
      console.log("signedMessage -->", { signedMessage });
    }
  }, [signer]);

  useEffect(() => {
    console.log("notifications -->", { notifications, transferState });
  }, [notifications, transferState]);

  return (
    <SignTxModal>
      <Box w="50%" h="50%" display="flex" flexDir="row" justifyContent="center" alignItems="center">
        {!connected ? (
          <BaseButton
            onPress={connect}
            bg={"blue.200"}
            px="2"
            py="2"
            _hover={{ bg: "blue.200" }}
            innerText={{ color: "black" }}
            text={"Connect Browser Wallet"}
          />
        ) : (
          <>
            <BaseButton
              onPress={connect}
              bg={"blue.200"}
              px="2"
              py="2"
              _hover={{ bg: "blue.200" }}
              innerText={{ color: "black" }}
              text={"Sign Message"}
            />
            <BaseButton
              onPress={connect}
              bg={"blue.200"}
              px="2"
              py="2"
              _hover={{ bg: "blue.200" }}
              innerText={{ color: "black" }}
              text={"Transfer 10G$ to self"}
            />
          </>
        )}
      </Box>
      <Box>
        {notifications.map(notification => {
          if ("transaction" in notification)
            return (
              <VStack key={notification.id} space={4} alignItems="center">
                <Center>id: {notification.id} </Center>
                <Center>type: {notification.type} </Center>
                <Center>transactionName: {notification.transactionName} </Center>
                <Center>submittedAt: {notification.submittedAt} </Center>
              </VStack>
            );
        })}
      </Box>
    </SignTxModal>
  );
};

export default {
  title: "Core/Web3/SignTxModal",
  component: SignTxModalExample,
  decorators: [
    (Story: any) => (
      <W3Wrapper withMetaMask={true} env="fuse">
        <Story />
      </W3Wrapper>
    )
  ],
  argTypes: {}
};

export const SignTxModalStory = {
  args: {}
};
