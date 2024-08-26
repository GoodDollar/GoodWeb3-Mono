import React, { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { View } from "native-base";
import { TransactionStatus, useEthers } from "@usedapp/core";

import { isTxReject } from "../utils/transactionType";
import { getUnclaimedPools } from "../utils/pools";
import { StartClaim, PreClaim } from "../screens";
import { PostClaim } from "../screens/PostClaim";
import { ErrorModal, TxDetailsModal, TxModal } from "../../../core/web3/modals";
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
    title: /*i18n*/ {
      id: "Please sign with \n your wallet \n({remainingClaims} transactions left)",
      values: { remainingClaims: remainingClaims }
    }
  };

  return status === "PendingSignature" ? (
    <TxModal type="sign" customTitle={customTitle} isPending={status === "PendingSignature"} />
  ) : status === "Mining" ? (
    //todo: add success modal / handle by app
    <TxModal type="send" isPending={status === "Mining"} onClose={onClose} />
  ) : null;
};

const WizardWrapper: FC<PropsWithChildren> = ({ children }) => {
  const {
    claimDetails,
    poolsDetails,
    claimStatus,
    error,
    loading,
    claimFlowStatus,
    withSignModals,
    txDetails,
    setTxDetails,
    setError,
    resetState,
    onClaimSuccess,
    onClaimFailed
  } = useClaimContext();
  const { account, chainId } = useEthers();
  const { goToStep, stepCount } = useWizard();
  const lastStep = stepCount - 1;
  const { errorMessage = "", status } = claimStatus;
  const isReject = isTxReject(errorMessage);
  const { transaction, isOpen } = txDetails;

  const handleClose = useCallback(() => {
    if (!isTxReject(error ?? "")) {
      goToStep(lastStep);
    }

    setError(undefined);
  }, [error]);

  const handleNext = useCallback(async () => {
    const { isClaimingDone } = claimFlowStatus;
    const unclaimedPools = getUnclaimedPools(poolsDetails);

    if (status === "Success") {
      if (isClaimingDone) {
        await onClaimSuccess();
      } else {
        resetState();
      }
      return;
    }

    if (claimDetails?.hasClaimed && !isReject && unclaimedPools?.length === 0 && !loading) {
      goToStep(lastStep);
    } else if (account) {
      goToStep(1);
    }
  }, [account, claimDetails, status, isReject, claimFlowStatus, poolsDetails]);

  useEffect(() => {
    void (async () => {
      if (isReject || status === "Exception") {
        void onClaimFailed();
      } else {
        void handleNext();
      }
    })();
  }, [isReject, handleNext, onClaimFailed]);

  useEffect(() => {
    if (!account) {
      goToStep(0);
    } else {
      goToStep(1);
    }
  }, [account, /* used */ chainId]);

  return (
    <View>
      {error ? <ErrorModal error={error} onClose={handleClose} overlay="dark" /> : null}

      {/* This is optional, should be possible to be overriden or handled by app */}
      {withSignModals ? (
        <TxModalStatus remainingClaims={claimFlowStatus.remainingClaims} txStatus={claimStatus} onClose={handleClose} />
      ) : null}
      {isOpen ? (
        <TxDetailsModal
          open={isOpen}
          onClose={() => setTxDetails((prev: any) => ({ ...prev, isOpen: false }))}
          tx={transaction}
        />
      ) : null}
      {/* {withSignModals ? <TxModalStatus txStatus={poolClaimStatus} onClose={handleClose} /> : null} */}
      {/* <TxModalStatus txStatus={claimStatus} onClose={handleClose} /> */}
      {children}
    </View>
  );
};

export const ClaimWizard: FC<any> = () => (
  <Wizard wrapper={<WizardWrapper />}>
    <StartClaim />
    <PreClaim />
    <PostClaim />
  </Wizard>
);
