import React, { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { View } from "native-base";
import { TransactionStatus } from "@usedapp/core";

import { isTxReject } from "../utils/transactionType";
import { StartClaim, PreClaim } from "../screens";
import { PostClaim } from "../screens/PostClaim";
import { ErrorModal, TxModal } from "../../../core/web3/modals";

import { ClaimWizardProps } from "../types";

type WizardWrapperProps = {
  error?: any;
  claimStatus: TransactionStatus;
  hasClaimed: boolean;
  onClaimFailed: (e?: any) => Promise<void>;
};

const TxModalStatus = ({ txStatus, onClose }: { txStatus: TransactionStatus; onClose: () => void }) => {
  const { status } = txStatus;

  return status === "PendingSignature" ? (
    <TxModal type="sign" isPending={status === "PendingSignature"} />
  ) : status === "Mining" || status === "Success" ? (
    //todo: add success modal / handle by app
    <TxModal type="send" isPending={status === "Mining" || status === "Success"} onClose={onClose} />
  ) : null;
};

const WizardWrapper: FC<PropsWithChildren<WizardWrapperProps>> = ({
  claimStatus,
  error,
  hasClaimed,
  onClaimFailed,
  children
}) => {
  const { goToStep, stepCount } = useWizard();

  const handleClose = useCallback(() => {
    if (!isTxReject(error)) {
      goToStep(2);
    }
  }, [error]);

  useEffect(() => {
    void (async () => {
      const { errorMessage = "", status } = claimStatus;
      const isReject = isTxReject(errorMessage);

      if (isReject) {
        void onClaimFailed();
      }
      console.log("goToStep -- should update modal", { stepCount, hasClaimed, isReject, status });
      if ((hasClaimed && !isReject) || status === "Success") {
        goToStep(stepCount - 1);
      }
    })();
  }, [hasClaimed, claimStatus]);

  return (
    <View>
      {error ? <ErrorModal error={error} onClose={handleClose} overlay="dark" /> : null}

      {/* This is optional, should be possible to be overriden or handled by app */}
      <TxModalStatus txStatus={claimStatus} onClose={handleClose} />

      {children}
    </View>
  );
};

export const ClaimWizard = ({
  account,
  chainId,
  claimStats,
  claimPools,
  claimStatus,
  handleConnect,
  onClaim
}: //onTxUpdate,
ClaimWizardProps) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const { errorMessage } = claimStatus ?? {};

  const onClaimFailed = useCallback(async () => {
    setError(errorMessage); //<-- todo: add proper error message
  }, [errorMessage]);

  return (
    <Wizard wrapper={<WizardWrapper {...{ claimStatus, error, hasClaimed: claimStats?.hasClaimed, onClaimFailed }} />}>
      {/* todo-fix: jump over from start claim > pre-claim */}
      <StartClaim {...{ account, chainId, handleConnect }} />
      <PreClaim {...{ claimPools, isWhitelisted: claimStats?.isWhitelisted, onClaim }} />
      <PostClaim {...{ claimPools, claimStats, claimStatus, onClaim, onClaimFailed }} />
    </Wizard>
  );
};
