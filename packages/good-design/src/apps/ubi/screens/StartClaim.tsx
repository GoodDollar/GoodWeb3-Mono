import React, { useEffect } from "react";
import { Center, Text, VStack } from "native-base";
import { SupportedChains } from "@gooddollar/web3sdk-v2";
import { useWizard } from "react-use-wizard";

import { Title } from "../../../core/layout";
import { Web3ActionButton } from "../../../advanced";
import { ClaimWizardProps } from "../types";

export const StartClaim = ({
  account,
  chainId,
  handleConnect
}: {
  account: string | undefined;
  chainId: number | undefined;
  handleConnect: ClaimWizardProps["handleConnect"];
}) => {
  const { nextStep } = useWizard();

  useEffect(() => {
    void (async () => {
      if (account && chainId && [SupportedChains.CELO, SupportedChains.FUSE].includes(chainId)) {
        await nextStep();
      }
    })();
  }, [account]);

  return (
    <VStack space="6" alignItems="center">
      <Title fontFamily="heading" fontSize="2xl" fontWeight="extrabold" pb="2" textAlign="center">
        {`Collect G$`}
      </Title>

      <Text w="100%" fontFamily="subheading" fontWeight="normal" color="goodGrey.500" fontSize="sm" textAlign="center">
        {`GoodDollar creates free money as a public \n good, G$ tokens, which you can collect daily.`}
      </Text>
      <Center w="100%" h="220">
        <Web3ActionButton
          variant="round"
          supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
          handleConnect={handleConnect}
          web3Action={nextStep}
          text={`Claim G$`}
          w="220"
          h="220"
        />
      </Center>
      {/* Add claim-carrousel */}
    </VStack>
  );
};
