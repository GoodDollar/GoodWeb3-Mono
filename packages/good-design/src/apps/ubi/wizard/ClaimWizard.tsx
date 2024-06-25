import React, { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { View } from "native-base";
import { TransactionStatus } from "@usedapp/core";

import { isTxReject } from "../utils/transactionType";
import { StartClaim, PreClaim } from "../screens";
import { PostClaim } from "../screens/PostClaim";
import { ErrorModal, TxModal } from "../../../core/web3/modals";
import { useClaimContext } from "../context/ClaimContext";

const TxModalStatus = ({
  remainingClaims,
  txStatus,
  onClose
}: {
  remainingClaims: any;
  txStatus: TransactionStatus;
  onClose: () => void;
}) => {
  const { status } = txStatus;
  const customTitle = {
    title: `Please sign with \n your wallet \n(${remainingClaims} transactions left)`,
    content: "To complete this action, sign with your wallet."
  };

  return status === "PendingSignature" ? (
    <TxModal type="sign" customTitle={customTitle} isPending={status === "PendingSignature"} />
  ) : status === "Mining" ? (
    //todo: add success modal / handle by app
    <TxModal type="send" isPending={status === "Mining"} onClose={onClose} />
  ) : null;
};

const WizardWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { claimDetails, claimStatus, error, claimFlowStatus, withSignModals, onClaimSuccess, onClaimFailed } =
    useClaimContext();
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
    const { isClaimingDone } = claimFlowStatus;

    if (status === "Success" && isClaimingDone) {
      await onClaimSuccess();
    }

    if (claimDetails?.hasClaimed && !isReject && isClaimingDone) {
      goToStep(lastStep);
    }
  }, [claimDetails, status, isReject, claimFlowStatus]);

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
      {withSignModals ? (
        <TxModalStatus remainingClaims={claimFlowStatus.remainingClaims} txStatus={claimStatus} onClose={handleClose} />
      ) : null}
      {/* {withSignModals ? <TxModalStatus txStatus={poolClaimStatus} onClose={handleClose} /> : null} */}
      {/* <TxModalStatus txStatus={claimStatus} onClose={handleClose} /> */}
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
