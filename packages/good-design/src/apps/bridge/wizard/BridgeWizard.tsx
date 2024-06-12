import React, { FC, PropsWithChildren, useEffect } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { noop } from "lodash";

import { MicroBridge } from "../MicroBridge";
import { MicroBridgeStatus } from "../MicroBridgeStatus";
import type { MicroBridgeProps } from "../types";
import { isTxReject } from "../../../utils";
import { TxModalStatus } from "../../../core/web3";

const WizardWrapper: FC<
  PropsWithChildren<{
    bridgeRequestStatus: MicroBridgeProps["bridgeStatus"];
    selfRelayStatus: MicroBridgeProps["selfRelayStatus"];
  }>
> = ({ bridgeRequestStatus, selfRelayStatus, children }) => {
  const { goToStep } = useWizard();
  const { errorMessage = "" } = bridgeRequestStatus ?? {};

  useEffect(() => {
    void (async () => {
      if (isTxReject(errorMessage)) {
        goToStep(0);
      }
    })();
  }, [errorMessage]);

  return (
    <>
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
  pendingTransaction,
  limits,
  fees,
  bridgeStatus,
  relayStatus,
  selfRelayStatus,
  onBridgeStart,
  onBridgeSuccess,
  onBridgeFailed
}: MicroBridgeProps) => (
  <Wizard header={<WizardWrapper {...{ bridgeRequestStatus: bridgeStatus, selfRelayStatus }} />}>
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
    <MicroBridgeStatus {...{ bridgeStatus, originChain, pendingTransaction, relayStatus, selfRelayStatus }} />
  </Wizard>
);
