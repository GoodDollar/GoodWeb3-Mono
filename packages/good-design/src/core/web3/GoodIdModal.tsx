import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Text } from "native-base";
import { SupportedChains, useFVLink } from "@gooddollar/web3sdk-v2";
import { InterfaceBoxProps } from "native-base/lib/typescript/components/primitives/Box";

import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";
import { Web3ActionButton } from "../../advanced";

interface GoodIdModal {
  account: string;
  onClose: () => void;
}

const CentreBox = ({ children, ...props }: InterfaceBoxProps) => (
  <Box display="flex" justifyContent="center" alignItems="center" {...props}>
    {children}
  </Box>
);

const GoodIdHeader = () => (
  <CentreBox backgroundColor={"white"}>
    <Title mb="2" color="main" fontSize="xl" lineHeight="36px">
      {`GoodID`}
    </Title>
  </CentreBox>
);

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

  return (
    <CentreBox backgroundColor="white" mt="100" borderColor="borderGrey" borderWidth="1" padding="10" borderRadius="20">
      <Title mb="2" color="main" fontSize="xl" lineHeight="36px">
        {`GoodID`}
      </Title>
      <Text>Wallet: {account}</Text>
      <CentreBox flexDir="row" justifyContent="flex-start">
        <Text>Face-Id:</Text>
        {!fvId ? (
          <Web3ActionButton
            marginLeft="4"
            text="Show my FaceId"
            web3Action={retreiveFaceId}
            variant="outlined"
            supportedChains={[SupportedChains.FUSE, SupportedChains.CELO]}
          />
        ) : (
          <CentreBox flexDir="row">
            <Text px="2">{fvId}</Text>
            <Button onPress={deleteFaceId} padding="0">
              <Text fontWeight="bold" fontSize="24">
                X
              </Text>
            </Button>
          </CentreBox>
        )}
      </CentreBox>
    </CentreBox>
  );
};

export const GoodIdModal = ({ account, onClose }: GoodIdModal) => {
  const { Modal, showModal } = useModal();

  useEffect(() => {
    showModal();
  }, [showModal]);

  return (
    <React.Fragment>
      <Modal
        _modalContainer={{ maxWidth: 600 }}
        header={<GoodIdHeader />}
        body={<GoodIdDetails account={account} />}
        onClose={onClose}
        closeText="x"
      />
    </React.Fragment>
  );
};
