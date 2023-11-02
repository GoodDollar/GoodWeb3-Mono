import React, { useCallback, useEffect, useRef, useState } from "react";
import { Onramper } from "./Onramper";
import { useEthers, useEtherBalance, useTokenBalance, useCall } from "@usedapp/core";
import { WebViewMessageEvent } from "react-native-webview";
import { useContractFunctionWithDefaultGasFees, useGetContract } from "@gooddollar/web3sdk-v2";
import * as ethers from "ethers";
import { Contract } from "ethers";
import { useModal } from "../../hooks/useModal";
import { View, Text } from "native-base";
import { WalletAndChainGuard } from "../../core";
import { useSignWalletModal } from "../../hooks/useSignWalletModal";

export const OnramperController = () => {
  const cusd = "0x765de816845861e75a25fca122bb6898b8b1282a";
  const { account, chainId, library } = useEthers();
  const swapLock = useRef(false);

  const { SignWalletModal } = useSignWalletModal();

  // const buygdFactory = useGetContract("BuyGDFactory", false, "base");
  const buygdFactory = new Contract("0x00e533B7d6255D05b7f15034B1c989c21F51b91C", [
    "function createAndSwap(address owner,uint256 minAmount) external returns(address)",
    "function predict(address owner) external view returns(address)"
  ]);

  const targetGDHelper = useCall(
    account &&
      buygdFactory && {
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
  // const accountCeloBalance = useEtherBalance(account, { refresh: 1 }) || ethers.constants.Zero;

  const cusdBalance = useTokenBalance(cusd, gdHelperAddress, { refresh: 1 });

  const { showModal, Modal } = useModal();
  const { send: swap, state: swapState } = useContractFunctionWithDefaultGasFees(buygdInstance, "swap", {
    transactionName: "Exchange bought tokens to G$"
  });

  const { send: createAndSwap, state: createState } = useContractFunctionWithDefaultGasFees(
    buygdFactory,
    "createAndSwap",
    {
      transactionName: "Deploy secure swap helper"
    }
  );

  const selfSwap = false; //accountCeloBalance.gt(ethers.utils.parseUnits("5", 9).mul(400000)); //400000 gas for swap * 5gwei gas price

  const [step, setStep] = useState(-1);

  // console.log({ selfSwap, account, gdHelperAddress, accountCeloBalance, cusdBalance, celoBalance });
  /**
   * callback to get event from onramper iframe
   */
  const callback = useCallback((event: WebViewMessageEvent) => {
    if ((event.nativeEvent.data as any).title === "success") {
      console.log("User succesfully bought CELO/CUSD -- awaiting arrival in sc wallet...");
      //start the stepper
      setStep(1);
    }
  }, []);

  const triggerSwap = async () => {
    if (swapLock.current) return; //prevent from useEffect retriggering this
    swapLock.current = true;

    try {
      setStep(2);
      //user sends swap tx
      if (selfSwap && gdHelperAddress && library && account) {
        const minAmount = 0; // we let contract use oracle for minamount, we might calculate it for more precision in the future
        const code = await library.getCode(gdHelperAddress);
        let swapTx;
        if (code.length <= 2) {
          console.log("deploying helper...");
          swapTx = createAndSwap(account, minAmount);
        } else {
          swapTx = swap(minAmount, account);
        }
        setStep(3);
        // after tx sent progress the stepper
        const res = await swapTx;
        console.log("swap tx res:", res);
        if (res?.status !== 1) throw Error("reverted");
      } else {
        //or sbackends sends swap tx
        const tx = fetch(`https://good-server.herokuapp.com/verify/swaphelper`, {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ account })
        });
        setStep(3);
        await tx;
      }
      // when done set stepper at final step
      setStep(4);
      swapLock.current = false;
    } catch (e: any) {
      console.log("swap error:", e.message, e);
      showModal();
      setStep(-1);
    }
  };

  // when the helper contract has some balance we trigger the swap
  useEffect(() => {
    if (cusdBalance?.gt(0) || celoBalance?.gt(0)) {
      console.log("starting swap:", cusdBalance?.toString(), celoBalance?.toString());
      triggerSwap().catch(e => {
        console.log(e);
      });
    }
  }, [celoBalance, cusdBalance]);

  const ErrorModal = () => (
    <View>
      <Text>Error</Text>
    </View>
  );

  return (
    <>
      <Modal body={<ErrorModal />} />
      <WalletAndChainGuard validChains={[42220]}>
        <Onramper
          onEvent={callback}
          targetWallet={gdHelperAddress || ""}
          step={step}
          setStep={setStep}
          targetNetwork="CELO"
          widgetParams={undefined}
        />
      </WalletAndChainGuard>
      <SignWalletModal txStatus={swapState?.status} />
      <SignWalletModal txStatus={createState?.status} />
    </>
  );
};
