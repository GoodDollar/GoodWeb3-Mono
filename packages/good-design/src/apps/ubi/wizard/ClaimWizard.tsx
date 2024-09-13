import React, { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { View } from "native-base";
import { useEthers } from "@usedapp/core";
import ethers from "ethers";

// import { isTxReject } from "../utils/transactionType";
import { CheckAvailableOffers, CheckAvailableOffersProps } from "../../goodid";
import { useGoodId } from "../../../hooks";
import { StartClaim, PreClaim } from "../screens";
import { PostClaim } from "../screens/PostClaim";
import { ErrorModal, TxDetailsModal, TxModal } from "../../../core/web3/modals";
import { useClaimContext } from "../context/ClaimContext";
import { isEmpty } from "lodash";
import { SupportedChains } from "@gooddollar/web3sdk-v2";

const WizardWrapper: FC<PropsWithChildren<{ skipOffer: Error | boolean | undefined }>> = ({ skipOffer, children }) => {
  const {
    claimDetails,
    claimFlowStatus,
    error,
    loading,
    poolsDetails,
    txDetails,
    withSignModals,
    onUpgrade,
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
  const { certificates } = useGoodId(account ?? "");

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
    } else if (chainId === SupportedChains.FUSE) {
      goToStep(1);
    } else if (account && chainId && !isEmpty(certificates)) {
      const hasValidCertificates = certificates.some(cert => cert.certificate);

      if (hasValidCertificates) {
        if (skipOffer) {
          goToStep(2);
        } else {
          goToStep(1);
        }
      } else {
        onUpgrade();
      }
    }
  }, [account, /*used*/ chainId, certificates, skipOffer]);

  return (
    <View>
      {error ? <ErrorModal error={error} onClose={handleClose} overlay="dark" /> : null}

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

export const ClaimWizard: FC<Omit<CheckAvailableOffersProps, "onDone">> = ({
  account,
  chainId,
  isDev = false,
  withNavBar = false
}) => {
  const [skipOffer, setSkipOffer] = useState<Error | boolean | undefined>(false);

  const onDone = useCallback(
    async (offerSkipped: Error | boolean | undefined) => {
      setSkipOffer(offerSkipped);
    },
    [skipOffer]
  );

  return (
    <Wizard wrapper={<WizardWrapper skipOffer={skipOffer} />}>
      <StartClaim />
      {chainId === SupportedChains.CELO ? (
        <CheckAvailableOffers {...{ account, chainId, isDev, onDone, withNavBar }} />
      ) : null}

      <PreClaim />
      <PostClaim />
    </Wizard>
  );
};
