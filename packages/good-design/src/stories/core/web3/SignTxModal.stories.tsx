import React, { useCallback, useEffect, useState } from "react";
import { SignTxModal } from "../../../core";
import { W3Wrapper } from "../../W3Wrapper";
import BaseButton from "../../../core/buttons/BaseButton";
import { Box, Button, HStack, Center } from "native-base";
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
      const signer = (library as ethers.providers.JsonRpcProvider)?.getSigner();
      setSigner(signer);
    }
  }, [library, connected]);

  useEffect(() => {
    console.log("notifications -->", { notifications, transferState });
  }, [notifications, transferState]);

  return (
    <SignTxModal>
      <Box w="50%" h="50%" display="flex" flexDir="row" justifyContent="center" alignItems="center">
        {!connected ? (
          <BaseButton
            onPress={connect}
            backgroundColor="main"
            px="2"
            py="2"
            _hover={{ bg: "blue.200" }}
            innerText={{ color: "black" }}
            text={"Connect Browser Wallet"}
          />
        ) : (
          <>
            <BaseButton
              onPress={send}
              backgroundColor="main"
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
              <HStack
                key={notification.id}
                space={1}
                alignItems="center"
                borderWidth="1"
                borderColor="black"
                py="1"
                px="1"
              >
                <Center px="1" borderWidth="1" borderColor="blue">
                  id: {notification.id}{" "}
                </Center>
                <Center px="1" borderWidth="1" borderColor="blue">
                  type: {notification.type}{" "}
                </Center>
                <Center px="1" borderWidth="1" borderColor="blue">
                  transactionName: {notification.transactionName}{" "}
                </Center>
                <Center px="1" borderWidth="1" borderColor="blue">
                  submittedAt: {notification.submittedAt}{" "}
                </Center>
              </HStack>
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
