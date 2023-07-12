import React, { useCallback, useEffect, useRef, useState } from "react";
import { Onramper } from "./Onramper";
import { useEthers, useEtherBalance } from "@usedapp/core";
import { WebViewMessageEvent } from "react-native-webview";
export const OnramperController = () => {
  const { account } = useEthers();
  const [targetWallet] = useState("");
  const targetWalletRef = useRef("");
  const balance = useEtherBalance(targetWalletRef.current);
  const [step, setStep] = useState(-1);

  const callback = useCallback((event: WebViewMessageEvent) => {
    if (event.nativeEvent.title === "success") {
      targetWalletRef.current = targetWallet;
      setStep(0);
    }
  }, []);

  const triggerSwap = async () => {
    //await tx
    //setStep(2)
  };

  useEffect(() => {
    if (account) {
      //predict(account).then(setTargetWallet)
    }
  }, [account]);
  useEffect(() => {
    if (balance?.gt(0)) {
      setStep(1);
      triggerSwap().catch(e => {
        console.log(e);
      });
    }
  }, [balance]);
  return <Onramper onEvent={callback} targetWallet={account} step={step} />;
};
