import React, { FC, useEffect } from "react";
import { Center, Spinner, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { Web3ActionButton } from "../../../advanced";
import { Image } from "../../../core/images";
import { GdAmount, TransTitle } from "../../../core/layout";
import { useGoodId } from "../../../hooks";
import { TransactionList } from "../components/TransactionStateCard";

import BillyGrin from "../../../assets/images/billy-grin.png";
import ClaimFooter from "../../../assets/images/claim-footer.png";
import { useClaimContext } from "../context";

export const PreClaim: FC = () => {
  const { goToStep, stepCount } = useWizard();
  const {
    account = "",
    claimPools,
    claimDetails,
    supportedChains,
    onClaim,
    onTxDetailsPress,
    onUpgrade
  } = useClaimContext();
  const { totalAmount, transactionList } = claimPools ?? {};
  const { isWhitelisted } = useGoodId(account);

  useEffect(() => {
    const claimConfirmed = transactionList?.some(tx => tx.type === "claim-confirmed");
    if (claimConfirmed) {
      goToStep(stepCount - 1);
    }

    if (isWhitelisted === false) {
      onUpgrade();
    }
  }, [transactionList]);

  if ((claimDetails?.isWhitelisted as any) === undefined || transactionList === undefined)
    return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack justifyContent="center" alignItems="center">
      <TransTitle t={/*i18n*/ "Claim your share"} variant="title-gdblue" marginTop="6" marginBottom="2" fontSize="xl" />
      <VStack space={10} width="343">
        <VStack space={8}>
          <VStack space={4} alignItems="center">
            <Center borderWidth="2" borderColor="borderDarkGrey" px="56px" py="3" borderRadius="8">
              <GdAmount amount={totalAmount} withDefaultSuffix />
            </Center>
          </VStack>
          <TransactionList transactions={transactionList} onTxDetailsPress={onTxDetailsPress} />
        </VStack>
        <Center>
          <VStack space={0} alignItems="center">
            <Image source={BillyGrin} w="93" h="65" style={{ resizeMode: "contain" }} />
            <Web3ActionButton
              text={/*i18n*/ "Claim Now"}
              web3Action={onClaim}
              variant="round"
              supportedChains={supportedChains}
              w="160"
              h="160"
              // onEvent={onEvent} <-- todo: add event handling
            />
          </VStack>
        </Center>
      </VStack>
      <Center w="full">
        <Image source={ClaimFooter} w="100%" h="140" style={{ resizeMode: "contain" }} />
      </Center>
    </VStack>
  );
};
