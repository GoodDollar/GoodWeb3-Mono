import React, { FC } from "react";
import { Center, Spinner, VStack } from "native-base";
import { isEmpty, noop } from "lodash";

import { TransTitle, TransText } from "../../../core/layout";
import { Web3ActionButton } from "../../../advanced";
import { useClaimContext } from "../context";
import { useGoodId } from "../../../hooks";

export const StartClaim: FC<{ connectedAccount: string }> = ({ connectedAccount }) => {
  const { account, chainId, supportedChains, onConnect } = useClaimContext();
  const { certificates } = useGoodId(account ?? "");

  // navigation to either upgrade flow / claim flow / or showing an eligible offer
  // is handled in the ClaimWizardWrapper
  // this loader is for awaiting the 'next step decision'
  if ((!isEmpty(certificates) || !chainId) && (account || connectedAccount))
    return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack space="6" alignItems="center">
      <TransTitle
        t={/*i18n*/ "Collect G$"}
        fontFamily="heading"
        fontSize="2xl"
        fontWeight="extrabold"
        pb="2"
        textAlign="center"
      />

      <TransText
        t={/*i18n*/ "GoodDollar creates free money as a public \n good, G$ tokens, which you can collect daily."}
        w="100%"
        fontFamily="subheading"
        fontWeight="normal"
        color="goodGrey.500"
        fontSize="sm"
        textAlign="center"
      />
      <Center w="100%" h="220">
        <Web3ActionButton
          variant="round"
          supportedChains={supportedChains}
          handleConnect={onConnect}
          web3Action={noop}
          text={/*i18n*/ "Claim G$"}
          w="220"
          h="220"
        />
      </Center>
    </VStack>
  );
};
