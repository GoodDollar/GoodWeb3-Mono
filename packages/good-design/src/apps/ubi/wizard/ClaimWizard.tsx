import React, { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { View } from "native-base";
import { TransactionStatus, useEthers } from "@usedapp/core";
import ethers from "ethers";

// import { isTxReject } from "../utils/transactionType";
import { StartClaim, PreClaim } from "../screens";
import { PostClaim } from "../screens/PostClaim";
import { ErrorModal, TxDetailsModal, TxModal } from "../../../core/web3/modals";
import { useClaimContext } from "../context/ClaimContext";

export const TxModalStatus = ({
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
    claimFlowStatus,
    error,
    loading,
    poolsDetails,
    txDetails,
    withSignModals,
    setTxDetails,
    setError,
    onClaimSuccess,
    onClaimFailed
  } = useClaimContext();
  const { account, chainId } = useEthers();
  const { goToStep, stepCount } = useWizard();
  const lastStep = stepCount - 1;
  const { isClaiming, isClaimingDone, error: claimError, remainingClaims, claimReceipts } = claimFlowStatus;
  const { transaction, isOpen } = txDetails;

  const customTitle = {
    title: /*i18n*/ {
      id: "Please sign with \n your wallet \n({remainingClaims} transactions left)",
      values: { remainingClaims: remainingClaims }
    }
  };

  const handleClose = useCallback(() => {
    setError(undefined);
  }, [claimFlowStatus]);

  const handleNext = useCallback(async () => {
    if (isClaimingDone) {
      await onClaimSuccess();
      goToStep(lastStep);
    } else if (remainingClaims === 0 && claimError) {
      await onClaimFailed();
    }
  }, [account, claimDetails, claimFlowStatus, loading, poolsDetails]);

  useEffect(() => {
    void (async () => {
      void handleNext();
    })();
  }, [/*used*/ claimFlowStatus.isClaimingDone, claimFlowStatus.remainingClaims]);

  useEffect(() => {
    if (!account) {
      goToStep(0);
    }
  }, [account]);

  useEffect(() => {
    goToStep(1);
  }, [/* used*/ chainId]);

  return (
    <View>
      {error ? <ErrorModal error={error} onClose={handleClose} overlay="dark" /> : null}

      {/* This is optional, should be possible to be overriden or handled by app */}
      {/* {withSignModals && isClaiming ? (
        <TxModalStatus remainingClaims={claimFlowStatus.remainingClaims} txStatus={isClaiming} onClose={handleClose} />
      ) : null} */}
      {isClaiming && withSignModals ? (
        <TxModal type="sign" customTitle={customTitle} isPending={isClaiming} />
      ) : remainingClaims !== undefined ? (
        <TxModal
          type="send"
          isPending={
            !isClaimingDone &&
            remainingClaims > 0 &&
            claimReceipts?.every((tx: ethers.providers.TransactionReceipt) => tx?.confirmations > 0)
          }
          onClose={handleClose}
        />
      ) : null}

      {/* TxDetailsModal */}
      {isOpen ? (
        <TxDetailsModal
          open={isOpen}
          onClose={() => setTxDetails((prev: any) => ({ ...prev, isOpen: false }))}
          tx={transaction}
        />
      ) : null}
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
