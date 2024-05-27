import React, { FC, PropsWithChildren, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { View } from "native-base";

import { StartClaim, PreClaim } from "../screens";
import { PostClaim } from "../screens/PostClaim";
import { ErrorModal } from "../../../core/web3/modals";

import { ClaimWizardProps } from "../types";

type WizardWrapperProps = {
  error?: any;
};

const WizardWrapper: FC<PropsWithChildren<WizardWrapperProps>> = ({ error, children }) => {
  const { goToStep } = useWizard();

  const handleClose = () => {
    goToStep(2);
  };

  return (
    <View>
      {error ? <ErrorModal error={error} onClose={handleClose} overlay="dark" /> : null}

      {children}
    </View>
  );
};

export const ClaimWizard = ({ account, chainId, claimStats, claimPools, handleConnect, onClaim }: ClaimWizardProps) => {
  const [error, setError] = useState<string | undefined>(undefined);

  const onClaimFailed = async () => {
    setError("Claim failed"); //<-- todo: add proper error message
  };

  return (
    <Wizard wrapper={<WizardWrapper error={error} />}>
      {/* todo-fix: jump over from start claim > pre-claim */}
      <StartClaim {...{ account, chainId, handleConnect }} />
      <PreClaim {...{ claimPools, claimStats, onClaim, onClaimFailed }} />
      <PostClaim />
    </Wizard>
  );
};
