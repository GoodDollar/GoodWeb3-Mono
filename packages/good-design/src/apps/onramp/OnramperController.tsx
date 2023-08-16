import React, { useCallback, useEffect, useRef, useState } from "react";
import { Onramper } from "./Onramper";
import { useEthers, useEtherBalance, useTokenBalance, useCall } from "@usedapp/core";
import { WebViewMessageEvent } from "react-native-webview";
import { useContractFunctionWithDefaultGasFees, useGetContract } from "@gooddollar/web3sdk-v2";
import * as ethers from "ethers";
import { Contract } from "ethers";
import { useModal } from "../../hooks/useModal";
import { View, Text } from "native-base";

export const OnramperController = () => {
  const cdai = "";
  const { account, chainId, library } = useEthers();
  const swapLock = useRef(false);
  // const buygdFactory = useGetContract("BuyGDFactory", false, "base") as BuyGDCloneFactory;
  const buygdFactory = new Contract("0xd34CC10b2846992970354B601105Dbf5654bdE95", [
    "function createAndSwap(address owner,uint256 minAmount) external returns(address)",
    "function predict(address owner) external view returns(address)"
  ]);

  const targetGDHelper = useCall(
    account && {
      contract: buygdFactory,
      method: "predict",
      args: [account]
    },

    { refresh: "never", chainId }
  );
  const gdHelperAddress = targetGDHelper?.value?.[0];
  const buygdInstance = new Contract(gdHelperAddress || ethers.constants.AddressZero, [
    "function swap(uint256 minAmount,address gasRefund) external"
  ]);
  const celoBalance = useEtherBalance(gdHelperAddress, { refresh: 1 });
  const accountCeloBalance = useEtherBalance(account, { refresh: 1 }) || ethers.constants.Zero;

  const cdaiBalance = useTokenBalance(cdai, gdHelperAddress, { refresh: 1 });

  const { showModal, Modal } = useModal();
  const { send: swap } = useContractFunctionWithDefaultGasFees(buygdInstance, "swap", {
    transactionName: "Exchange bought tokens to G$"
  });

  const { send: createAndSwap } = useContractFunctionWithDefaultGasFees(buygdFactory, "createAndSwap", {
    transactionName: "Deploy secure swap helper"
  });

  const selfSwap = accountCeloBalance.gt(ethers.utils.parseUnits("5", 9).mul(300000)); //300000 gas for swap * 5gwei gas price

  const [step, setStep] = useState(-1);

  console.log({ selfSwap, account, gdHelperAddress, accountCeloBalance, cdaiBalance, celoBalance });
  /**
   * callback to get event from onramper iframe
   */
  const callback = useCallback((event: WebViewMessageEvent) => {
    if ((event.nativeEvent.data as any).title === "success") {
      //start the stepper
      setStep(0);
    }
  }, []);

  const triggerSwap = async () => {
    if (swapLock.current) return; //prevent from useEffect retriggering this
    swapLock.current = true;

    try {
      setStep(1);
      //user sends swap tx
      if (selfSwap && gdHelperAddress && library && account) {
        const minAmount = 0; // we let contract use oracle for minamount, we might calculate it for more precision in the future
        const code = await library.getCode(gdHelperAddress);
        let swapTx;
        if (code.length <= 2) {
          console.log("deploying helper...");
          swapTx = createAndSwap(account, minAmount);
        } else {
          swapTx = swap(minAmount);
        }
        setStep(2);
        // after tx sent progress the stepper
        const res = await swapTx;
        console.log("swap tx res:", res);
        if (res?.status !== 1) throw Error("reverted");
      } else {
        //or sbackends sends swap tx
        const tx = fetch(`/swap/${gdHelperAddress}`);
        setStep(2);
        await tx;
      }
      // when done set stepper at final step
      setStep(3);
    } catch (e: any) {
      console.log("swap error:", e.message, e);
      showModal();
      setStep(-1);
    } finally {
      swapLock.current = false;
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
      <Onramper
        onEvent={callback}
        targetWallet={gdHelperAddress || "0x0"}
        step={step}
        targetNetwork="CELO"
        widgetParams={undefined}
      />
    </>
  );
};
