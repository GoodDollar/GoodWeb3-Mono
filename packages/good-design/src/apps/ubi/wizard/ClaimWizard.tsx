import React, { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { View } from "native-base";
import { TransactionStatus } from "@usedapp/core";

import { isTxReject } from "../utils/transactionType";
import { StartClaim, PreClaim } from "../screens";
import { PostClaim } from "../screens/PostClaim";
import { ErrorModal, TxModal } from "../../../core/web3/modals";
import { useClaimContext } from "../context/ClaimContext";

const TxModalStatus = ({ txStatus, onClose }: { txStatus: TransactionStatus; onClose: () => void }) => {
  const { status } = txStatus;

  return status === "PendingSignature" ? (
    <TxModal type="sign" isPending={status === "PendingSignature"} />
  ) : status === "Mining" || status === "Success" ? (
    //todo: add success modal / handle by app
    <TxModal type="send" isPending={status === "Mining" || status === "Success"} onClose={onClose} />
  ) : null;
};

const WizardWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { claimStats, claimStatus, error, withSignModals, onClaimSuccess, onClaimFailed } = useClaimContext();
  const { goToStep, stepCount } = useWizard();
  const lastStep = stepCount - 1;
  const { errorMessage = "", status } = claimStatus;
  const isReject = isTxReject(errorMessage);

  const handleClose = useCallback(() => {
    if (!isTxReject(error ?? "")) {
      goToStep(lastStep);
    }
  }, [error]);

  const handleNext = useCallback(async () => {
    if (status === "Success") {
      await onClaimSuccess();
    }

    if ((claimStats?.hasClaimed && !isReject) || status === "Success") {
      goToStep(stepCount - 1);
    }
  }, [claimStats, status, isReject]);

  useEffect(() => {
    void (async () => {
      if (isReject) {
        void onClaimFailed();
      } else {
        void handleNext();
      }
    })();
  }, [isReject, handleNext, onClaimFailed]);

  return (
    <View>
      {error ? <ErrorModal error={error} onClose={handleClose} overlay="dark" /> : null}

      {/* This is optional, should be possible to be overriden or handled by app */}
      {withSignModals ? <TxModalStatus txStatus={claimStatus} onClose={handleClose} /> : null}
      <TxModalStatus txStatus={claimStatus} onClose={handleClose} />

      {children}
    </View>
  );
};

export const ClaimWizard: FC<any> = () => (
  <Wizard wrapper={<WizardWrapper />}>
    {/* todo-fix: jump over from start claim > pre-claim */}
    <StartClaim />
    <PreClaim />
    <PostClaim />
  </Wizard>
);
