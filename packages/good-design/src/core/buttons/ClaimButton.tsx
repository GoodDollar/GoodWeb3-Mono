import React, { useEffect, useCallback, useMemo, useState } from "react";
import { SupportedChains, useClaim, useGetEnvChainId, useWhitelistSync, G$Amount } from "@gooddollar/web3sdk-v2";
import { Text, View } from "native-base";
import { noop, isNil } from "lodash";
import { useEthers } from "@usedapp/core";

import { useQueryParam } from "../../hooks/useQueryParam";
import { Web3ActionButton } from "../../advanced";
import { FVFlowProps } from "./types";
import { TxModal, VerifyUniqueModal } from "../web3";

const ClaimButton = ({
  firstName,
  method,
  refresh,
  claimed,
  claiming,
  claim,
  chainId,
  handleConnect,
  onEvent,
  redirectUrl,
  ...props
}: FVFlowProps) => {
  const { account } = useEthers();
  const [claimConfirming, setClaimConfirming] = useState<boolean | undefined>(undefined);
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [faceVerifying, setFaceVerifying] = useState(false);

  const { isWhitelisted, claimAmount } = useClaim(refresh);
  const isVerified = useQueryParam("verified", true);
  const { chainId: defaultChainId, defaultEnv } = useGetEnvChainId();
  const { fuseWhitelisted, syncStatus } = useWhitelistSync();

  const handleClaim = useCallback(async () => {
    const success = await claim();
    if (success !== true) {
      return;
    }
  }, [claim, setClaimConfirming]);

  const handleModalOpen = useCallback(async () => {
    if (isNil(isWhitelisted)) {
      // no value for isWhitelisted means we are not having a established connection to bc yet but should expect soon, handled by useEffect
      setWhitelistLoading(true);
      return;
    }

    if (isWhitelisted) {
      await handleClaim();
      return;
    } else {
      // means we no longer are expecting a claimCall and actionModal should show default verify uniqueness message
      setClaimConfirming(false);
      setFaceVerifying(true);
    }

    if (fuseWhitelisted && syncStatus) {
      const success = await syncStatus;

      if (!success) {
        return;
      }

      await handleClaim();
    }
  }, [isWhitelisted, fuseWhitelisted, syncStatus, faceVerifying, setClaimConfirming, setWhitelistLoading, handleClaim]);

  useEffect(() => {
    if (claiming?.status === "PendingSignature") {
      setClaimConfirming(true);
      return;
    }

    setClaimConfirming(false);
  }, [claiming]);

  const buttonTitle = useMemo(() => {
    if (!isWhitelisted || !claimAmount) {
      return "CLAIM NOW";
    }

    const amount = G$Amount("G$", claimAmount, chainId ?? defaultChainId, defaultEnv);

    return "CLAIM NOW " + amount.format({ fixedPrecisionDigits: 2, useFixedPrecision: true, significantDigits: 2 });
  }, [isWhitelisted, chainId, claimAmount, defaultChainId, defaultEnv]);

  // handles a delay in fetching isWhitelisted after just being connected
  useEffect(() => {
    if (whitelistLoading) {
      // making sure it only runs once (is set after useEffect completes)
      setWhitelistLoading(false);
      handleModalOpen().catch(noop);
    }
  }, [/* used */ isWhitelisted, whitelistLoading, setWhitelistLoading, handleModalOpen]);

  // trigger claim when user succesfully has verified through FV
  // uses the first claimer flow
  useEffect(() => {
    const doClaim = async () => {
      if (isVerified && account) {
        setClaimConfirming(true);
        await handleClaim();
      }
    };

    if (claimed === false && claimConfirming === undefined) doClaim().catch(noop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified, account, claimed, claimConfirming]);

  return (
    <View flex={1} w="full" {...props}>
      <View w="full" alignItems="center" pt="8" pb="8">
        <Web3ActionButton
          text={buttonTitle}
          web3Action={handleModalOpen}
          disabled={claimed}
          variant="round"
          supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
          handleConnect={handleConnect}
          w="220"
          h="220"
          onEvent={onEvent}
        />
        <Text variant="shadowed" fontSize="md" />
      </View>
      {faceVerifying && !isWhitelisted ? (
        <VerifyUniqueModal
          open={faceVerifying}
          url={redirectUrl}
          onClose={() => {
            setFaceVerifying(false);
          }}
          chainId={chainId}
          firstName={firstName}
          method={method}
        />
      ) : claimConfirming && (isVerified || isWhitelisted) ? (
        <TxModal type="sign" isPending={claimConfirming} />
      ) : claiming?.status === "Mining" || claiming?.status === "Success" ? ( // because of small delay we need to check for both so the modal does not close pre-maturely
        <TxModal type="send" isPending={true} />
      ) : null}
    </View>
  );
};

export default ClaimButton;
