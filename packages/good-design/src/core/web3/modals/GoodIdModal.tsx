import React, { useCallback, useState } from "react";
import { Button, Text, useBreakpointValue } from "native-base";
import { SupportedChains, useFVLink } from "@gooddollar/web3sdk-v2";

import { Title } from "../../layout";
import { Web3ActionButton } from "../../../advanced";
import { CentreBox } from "../../layout/CentreBox";

export const GoodIdDetails = ({ account }: { account: string }) => {
  const { getFvSig, deleteFvId } = useFVLink();

  const [fvId, setFvId] = useState<string | undefined>(undefined);

  const retreiveFaceId = useCallback(async () => {
    const sig = await getFvSig();
    setFvId(sig.slice(0, 42));
  }, [getFvSig]);

  const deleteFaceId = useCallback(async () => {
    const deleted = await deleteFvId();
    console.log("Fv is Deleted -->", { deleted });
  }, [fvId, deleteFvId]);

  const direction = useBreakpointValue({
    base: "column",
    lg: "row"
  });

  const fontSize = useBreakpointValue({
    base: "2xs",
    lg: "sm"
  });

  const margin = useBreakpointValue({
    base: "1",
    lg: "0"
  });

  const titleStyles = useBreakpointValue({
    base: { fontSize: "l", mb: "4" },
    lg: { fontSize: "xl", mb: "6" }
  });

  return (
    <CentreBox backgroundColor="white" mt="50" padding="10" borderRadius="20">
      <Title {...titleStyles} color="main" lineHeight="36px">
        {`GoodID`}
      </Title>
      <CentreBox flexDir={direction} justifyContent="flex-start">
        <Text textAlign="center" mb="2" fontSize={fontSize}>
          Wallet: {account}
        </Text>
      </CentreBox>
      <CentreBox flexDir={direction} justifyContent="flex-start">
        <Text fontSize={fontSize}>Face-Id:</Text>
        {!fvId ? (
          <Web3ActionButton
            ml="4"
            mt={margin}
            padding="0"
            text="Show my FaceId"
            web3Action={retreiveFaceId}
            variant="outlined"
            innerText={{ fontSize: 14 }}
            innerIndicatorText={{ color: "goodBlack.100" }}
            supportedChains={[SupportedChains.FUSE, SupportedChains.CELO]}
          />
        ) : (
          <CentreBox flexDir="row">
            <Text px="2" fontSize={fontSize}>
              {fvId}
            </Text>
            <Button onPress={deleteFaceId} padding="0">
              <Text fontWeight="bold" fontSize={fontSize}>
                X
              </Text>
            </Button>
          </CentreBox>
        )}
      </CentreBox>
      <CentreBox textAlign="center">
        <Text fontStyle="italic" fontSize={fontSize} mt="4" width="75%">
          Attention: GoodDollar-verifying a new wallet address can only be done 24h after deleting your old face-id.
        </Text>
      </CentreBox>
    </CentreBox>
  );
};
