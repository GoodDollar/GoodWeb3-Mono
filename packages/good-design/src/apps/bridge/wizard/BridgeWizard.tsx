import React, { FC, PropsWithChildren, useEffect } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { noop } from "lodash";

import { MicroBridge } from "../MicroBridge";
import { MicroBridgeStatus } from "../MicroBridgeStatus";
import type { MicroBridgeProps } from "../types";
import { isTxReject } from "../../../utils";
import { ErrorModal, TxModalStatus } from "../../../core/web3";

const WizardWrapper: FC<
  PropsWithChildren<{
    bridgeRequestStatus: MicroBridgeProps["bridgeStatus"];
    selfRelayStatus: MicroBridgeProps["selfRelayStatus"];
    error?: string | null;
  }>
> = ({ bridgeRequestStatus, error, selfRelayStatus, children }) => {
  const { goToStep } = useWizard();
  const { errorMessage = "" } = bridgeRequestStatus ?? {};

  useEffect(() => {
    void (async () => {
      if (isTxReject({ message: errorMessage })) {
        goToStep(0);
      }
    })();
  }, [errorMessage]);

  return (
    <>
      {error ? <ErrorModal error={error} overlay="dark" onClose={noop} /> : null}
      {bridgeRequestStatus ? <TxModalStatus txStatus={bridgeRequestStatus} onClose={noop} /> : null}
      {selfRelayStatus ? <TxModalStatus txStatus={selfRelayStatus} onClose={noop} /> : null}
      {children}
    </>
  );
};

export const BridgeWizard = ({
  useCanBridge,
  onSetChain,
  originChain,
  inputTransaction,
  error,
  pendingTransaction,
  limits,
  fees,
  bridgeStatus,
  relayStatus,
  selfRelayStatus,
  onBridgeStart,
  onBridgeSuccess,
  onBridgeFailed,
  withRelay
}: MicroBridgeProps) => (
  <Wizard header={<WizardWrapper {...{ bridgeRequestStatus: bridgeStatus, error, selfRelayStatus }} />}>
    <MicroBridge
      {...{
        // onBridge,
        useCanBridge,
        onSetChain,
        originChain,
        inputTransaction,
        pendingTransaction,
        limits,
        fees,
        bridgeStatus,
        relayStatus,
        selfRelayStatus,
        onBridgeStart,
        onBridgeSuccess,
        onBridgeFailed
      }}
    />
    <MicroBridgeStatus
      {...{ bridgeStatus, originChain, pendingTransaction, relayStatus, selfRelayStatus, withRelay }}
    />
  </Wizard>
);
