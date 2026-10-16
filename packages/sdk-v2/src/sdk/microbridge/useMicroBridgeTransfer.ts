import { TransactionStatus, useEthers } from "@usedapp/core";
import { Contract, ethers } from "ethers";
import { pickBy } from "lodash";
import { useCallback, useState } from "react";

import { useContractFunctionWithDefaultGasFees, useGasFees } from "../base/hooks/useGasFees";

export const isEip7702DelegationCode = (code: string) => /^0xef0100[0-9a-f]{40}$/i.test(code);

export const useMicroBridgeTransfer = (contract: Contract) => {
  const usedapp = useContractFunctionWithDefaultGasFees(contract, "transferAndCall", {
    transactionName: "BridgeTransfer"
  });
  const { account, chainId, library } = useEthers();
  const gasFees = useGasFees();
  const [usesWalletSigner, setUsesWalletSigner] = useState(false);
  const [walletSignerState, setWalletSignerState] = useState<TransactionStatus>();

  const resetState = useCallback(() => {
    setUsesWalletSigner(false);
    setWalletSignerState(undefined);
    usedapp.resetState();
  }, [usedapp]);

  const send = useCallback(
    async (...args: any[]) => {
      if (!library || !account || !chainId) return usedapp.send(...args);

      let code: string;
      try {
        code = await library.getCode(account);
      } catch (error: any) {
        setUsesWalletSigner(true);
        setWalletSignerState({
          status: "Exception",
          chainId,
          transactionName: "BridgeTransfer",
          errorMessage: error?.message || "Unable to check wallet code"
        });
        return undefined;
      }

      if (!isEip7702DelegationCode(code)) {
        setUsesWalletSigner(false);
        return usedapp.send(...args);
      }

      setUsesWalletSigner(true);
      setWalletSignerState({
        status: "PendingSignature",
        chainId,
        transactionName: "BridgeTransfer"
      });

      let transaction: ethers.providers.TransactionResponse | undefined;
      try {
        const inputs = contract.interface.getFunction("transferAndCall").inputs.length;
        const hasOverrides = args.length > inputs;
        const providedOverrides = hasOverrides ? args[args.length - 1] : {};
        const methodArgs = hasOverrides ? args.slice(0, -1) : args;
        const overrides = pickBy(
          {
            maxFeePerGas: gasFees.gasPrice,
            maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
            ...providedOverrides
          },
          value => value != null
        );
        const signer = (library as ethers.providers.Web3Provider).getSigner(account);
        transaction = (await contract
          .connect(signer)
          .transferAndCall(...methodArgs, overrides)) as ethers.providers.TransactionResponse;
        setWalletSignerState({
          status: "Mining",
          chainId,
          transaction,
          transactionName: "BridgeTransfer"
        });

        const submittedTransaction = transaction;
        void Promise.resolve()
          .then(() => submittedTransaction.wait())
          .then(receipt => {
            const failed = receipt.status === 0;
            setWalletSignerState({
              status: failed ? "Fail" : "Success",
              chainId,
              transaction: submittedTransaction,
              receipt,
              transactionName: "BridgeTransfer",
              errorMessage: failed ? "Bridge transaction failed" : undefined
            });
          })
          .catch((error: any) => {
            const receipt = error?.receipt as ethers.providers.TransactionReceipt | undefined;
            const replacement = error?.code === "TRANSACTION_REPLACED" && !error.cancelled;
            if (receipt && (error?.code !== "TRANSACTION_REPLACED" || replacement || error.cancelled)) {
              setWalletSignerState({
                status: !error.cancelled && receipt.status !== 0 ? "Success" : "Fail",
                chainId,
                transaction: replacement ? error.replacement : submittedTransaction,
                receipt,
                transactionName: "BridgeTransfer",
                errorMessage: error.cancelled || receipt.status === 0 ? "Bridge transaction failed" : undefined
              });
            } else {
              setWalletSignerState({
                status: "Mining",
                chainId,
                transaction: submittedTransaction,
                transactionName: "BridgeTransfer",
                errorMessage: "Unable to confirm transaction. Check its status using the transaction hash."
              });
            }
          });
        return transaction;
      } catch (error: any) {
        const receipt = error?.receipt as ethers.providers.TransactionReceipt | undefined;
        setWalletSignerState({
          status: transaction || receipt ? "Fail" : "Exception",
          chainId,
          transaction,
          receipt,
          transactionName: "BridgeTransfer",
          errorMessage: error?.reason || error?.message || "Bridge transaction failed"
        });
        return undefined;
      }
    },
    [account, chainId, contract, gasFees, library, usedapp]
  );

  return {
    ...usedapp,
    state: usesWalletSigner ? walletSignerState || usedapp.state : usedapp.state,
    resetState,
    send
  };
};
