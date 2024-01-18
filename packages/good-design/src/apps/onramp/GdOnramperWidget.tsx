import React, { useCallback, useEffect, useRef, useState } from "react";
import { Onramper } from "./Onramper";
import { useEthers, useEtherBalance, useTokenBalance } from "@usedapp/core";
import { WebViewMessageEvent } from "react-native-webview";
import { AsyncStorage, useBuyGd } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";

import { useModal } from "../../hooks/useModal";
import { View, Text } from "native-base";
import { WalletAndChainGuard } from "../../core";
import { useSignWalletModal } from "../../hooks/useSignWalletModal";

const ErrorModal = () => (
  <View>
    <Text>Something went wrong.</Text>
  </View>
);

interface IGdOnramperProps {
  isTesting?: boolean;
  onEvents: (action: string, data?: any, error?: string) => void;
  selfSwap?: boolean;
  withSwap?: boolean;
  donateOrExecTo?: string;
  callData?: string;
  apiKey?: string;
}

export const GdOnramperWidget = ({
  isTesting = false,
  onEvents = noop,
  selfSwap = false,
  withSwap = true,
  donateOrExecTo = undefined,
  callData = "0x",
  apiKey = undefined
}: IGdOnramperProps) => {
  const cusd = "0x765de816845861e75a25fca122bb6898b8b1282a";
  const { account, library } = useEthers();
  const swapLock = useRef(false);

  const { createAndSwap, swap, swapState, createState, gdHelperAddress, triggerSwapTx } = useBuyGd({
    donateOrExecTo,
    callData,
    withSwap
  });

  const { SignWalletModal } = useSignWalletModal();

  const celoBalance = useEtherBalance(gdHelperAddress, { refresh: 1 });
  // const accountCeloBalance = useEtherBalance(account, { refresh: 1 }) || ethers.constants.Zero;

  const cusdBalance = useTokenBalance(cusd, gdHelperAddress, { refresh: 1 });

  const { showModal, Modal } = useModal();

  const [step, setStep] = useState(0);

  // console.log({ selfSwap, account, gdHelperAddress, accountCeloBalance, cusdBalance, celoBalance });
  /**
   * callback to get event from onramper iframe
   */
  const callback = useCallback(async (event: WebViewMessageEvent) => {
    if ((event.nativeEvent.data as any).title === "success") {
      await AsyncStorage.setItem("gdOnrampSuccess", "true");
      //start the stepper
      setStep(2);
    }
  }, []);

  const triggerSwap = async () => {
    if (swapLock.current) return; //prevent from useEffect retriggering this
    swapLock.current = true;

    try {
      setStep(3);
      //user sends swap tx
      if (selfSwap && gdHelperAddress && library && account) {
        const minAmount = 0; // we let contract use oracle for minamount, we might calculate it for more precision in the future
        const code = await library.getCode(gdHelperAddress);
        let swapTx;
        if (code.length <= 2) {
          console.log("deploying helper...");
          swapTx = createAndSwap(minAmount);
        } else {
          swapTx = swap(minAmount);
        }

        setStep(4);
        // after tx sent progress the stepper
        const res = await swapTx;
        console.log("swap tx res:", res);
        if (res?.status !== 1) throw Error("reverted");
      } else {
        if (account) {
          //or backends sends swap tx
          setStep(4);
          const tx = await triggerSwapTx();

          if (!tx?.ok) throw Error("reverted");
        }
      }
      // when done set stepper at final step
      setStep(5);
      swapLock.current = false;
      onEvents("buy_success");
    } catch (e: any) {
      console.log("swap error:", e.message, e);
      showModal();
      onEvents("buygd_swap_failed", e.message);
      setStep(0);
    }
  };

  // when the helper contract has some balance we trigger the swap
  useEffect(() => {
    if (cusdBalance?.gt(0) || celoBalance?.gt(0)) {
      void AsyncStorage.removeItem("gdOnrampSuccess");
      console.log("starting swap:", cusdBalance?.toString(), celoBalance?.toString());
      triggerSwap().catch(e => {
        showModal();
        onEvents("buygd_swap_failed", e.message);
      });
    }
  }, [celoBalance, cusdBalance]);

  return (
    <>
      <Modal body={<ErrorModal />} _modalContainer={{ paddingBottom: 18, paddingLeft: 18, paddingRight: 18 }} />
      <WalletAndChainGuard validChains={[42220]}>
        <Onramper
          onEvent={callback}
          targetWallet={gdHelperAddress || ""}
          step={step}
          setStep={setStep}
          targetNetwork="CELO"
          widgetParams={undefined}
          isTesting={isTesting}
          onGdEvent={onEvents}
          apiKey={apiKey}
        />
      </WalletAndChainGuard>
      <SignWalletModal txStatus={swapState?.status} />
      <SignWalletModal txStatus={createState?.status} />
    </>
  );
};
