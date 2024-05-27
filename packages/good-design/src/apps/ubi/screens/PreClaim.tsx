import React, { useEffect } from "react";
import { Center, Spinner, VStack } from "native-base";
import { noop } from "lodash";

import type { CurrencyValue } from "@usedapp/core";
import { SupportedChains } from "@gooddollar/web3sdk-v2";

import { Web3ActionButton } from "../../../advanced";
import { Image } from "../../../core/images";
import { GdAmount, Title } from "../../../core/layout";
import { TransactionList } from "../components/TransactionStateCard";

import type { ClaimStats, ClaimWizardProps } from "../types";

import BillyGrin from "../../../assets/images/billy-grin.png";
import ClaimFooter from "../../../assets/images/claim-footer.png";
import { useWizard } from "react-use-wizard";

type PreClaimProps = {
  claimPools: { totalAmount: CurrencyValue; transactionList: any[] }; // <-- todo: define formatted transactionlsit type
  claimStats: Omit<ClaimStats, "claimCall">;
  onClaim: ClaimWizardProps["onClaim"];
  onClaimFailed: (e?: any) => void;
};

export const PreClaim = ({ claimPools, claimStats, onClaim, onClaimFailed }: PreClaimProps) => {
  const { totalAmount, transactionList } = claimPools ?? {};
  const { nextStep } = useWizard();
  const { hasClaimed, isWhitelisted } = claimStats;

  const handleClaim = async () => {
    // onClaim(transactionList); <-- todo: add claim from multiple pools flow
    //todo: handle user reject
    const claimed = await onClaim();
    if (!claimed) {
      void onClaimFailed();
    } else {
      //trigger succes modal / next-task modal
      // void onDone();
      void nextStep();
    }
  };

  useEffect(() => {
    void (async () => {
      if (hasClaimed) {
        await nextStep();
      }
    })();
  }, [hasClaimed]);

  if ((isWhitelisted as any) === undefined || transactionList?.length === 0 || transactionList === undefined)
    return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack justifyContent="center" alignItems="center">
      <Title variant="title-gdblue" marginTop="6" marginBottom="2" fontSize="xl">
        Claim your share
      </Title>
      <VStack space={10} width="343">
        <VStack space={8}>
          <VStack space={4} alignItems="center">
            <Center borderWidth="2" borderColor="borderDarkGrey" px="56px" py="3" borderRadius="8">
              <GdAmount amount={totalAmount} />
            </Center>
            <Image source={BillyGrin} w="93" h="65" style={{ resizeMode: "contain" }} />
          </VStack>
          <TransactionList transactions={transactionList} onTxDetails={noop} />
        </VStack>
        <Center>
          <Web3ActionButton
            text={`Claim Now`}
            web3Action={handleClaim}
            variant="round"
            supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
            w="160"
            h="160"
            // onEvent={onEvent} <-- todo: add event handling
          />
        </Center>
      </VStack>
      <Center w="full">
        <Image source={ClaimFooter} w="100%" h="140" style={{ resizeMode: "contain" }} />
      </Center>
    </VStack>
  );
};
