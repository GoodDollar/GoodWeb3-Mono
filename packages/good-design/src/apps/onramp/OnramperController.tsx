import React, { useCallback, useEffect, useRef, useState } from "react";
import { Onramper } from "./Onramper";
import { useEthers, useEtherBalance, useTokenBalance, useCall, useCalls } from "@usedapp/core";
import { WebViewMessageEvent } from "react-native-webview";
import { useContractFunctionWithDefaultGasFees, useGetContract } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { useModal } from "../../hooks/useModal";
import { View, Text } from "native-base";
export const OnramperController = () => {
  const cdai = "";
  const { account, chainId } = useEthers();
  const targetGDHelper = useCall(
    account && {
      contract: buygdFactory,
      method: "predict",
      args: [account]
    },

    { refresh: "never", chainId }
  );
  const celoBalance = useEtherBalance(targetGDHelper?.value);
  const cdaiBalance = useTokenBalance(cdai, targetGDHelper?.value);

  const buygd = useGetContract("BuyGDHelper", false, "base") as BuyGDHelper;
  const buygdFactory = useGetContract("BuyGDFactory", false, "base") as BuyGDFactory;

  const { showModal, hideModal, Modal } = useModal();
  const { send } = useContractFunctionWithDefaultGasFees(buygd, "swap", {
    transactionName: "Exchange bought tokens to G$"
  });

  const selfSwap = false;

  const [step, setStep] = useState(-1);

  /**
   * callback to get event from onramper iframe
   */
  const callback = useCallback((event: WebViewMessageEvent) => {
    if (event.nativeEvent.title === "success") {
      //start the stepper
      setStep(0);
    }
  }, []);

  const calcUniswapV3MinAmount = async () => {
    return BigNumber.from(0);
  };

  const triggerSwap = async () => {
    try {
      const minAmount = calcUniswapV3MinAmount();
      setStep(1);
      //user sends swap tx
      if (selfSwap) {
        const tx = send(minAmount);

        // after tx sent progress the stepper
        const res = await tx;
        if (res?.status !== 1) throw Error("reverted");
      } else {
        //or sbackends sends swap tx
        await fetch(`/swap/${targetGDHelper?.value}`);
      }
      // when done set stepper at final step
      setStep(2);
    } catch (e) {
      showModal();
    }
  };

  // when the helper contract has some balance we trigger the swap
  useEffect(() => {
    if (cdaiBalance?.gt(0) || celoBalance?.gt(0)) {
      triggerSwap().catch(e => {
        console.log(e);
      });
    }
  }, [celoBalance, cdaiBalance]);

  const ErrorModal = () => (
    <View>
      <Text>Error</Text>
    </View>
  );

  return (
    <>
      <Modal body={<ErrorModal />} />
      <Onramper onEvent={callback} targetWallet={targetGDHelper?.value} step={step} />;
    </>
  );
};
