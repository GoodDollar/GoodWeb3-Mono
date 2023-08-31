import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Text } from "native-base";
import { noop } from "lodash";
import { useFVLink } from "@gooddollar/web3sdk-v2";

import { useModal } from "../../hooks/useModal";
import { Title } from "../layout";

interface GoodIdModal {
  children: any;
  account: string;
}

const GoodIdHeader = () => (
  <Box backgroundColor={"white"}>
    <Title mb="2" color="main" fontSize="xl" lineHeight="36px">
      {`GoodID`}
    </Title>
  </Box>
);

const GoodId = ({ account }: { account: string }) => {
  const fvLink = useFVLink();
  const [fvId, setFvId] = useState<string | undefined>(undefined);

  const retreiveFaceId = useCallback(async () => {
    const sig = await fvLink.getFvSig();
    setFvId(sig.slice(0, 42));
  }, [fvLink]);

  return (
    <Box flexDir="column">
      <Text>Wallet: {account}</Text>
      <Text>
        Face-Id:
        {!fvId ? (
          <Button borderWidth="1" onPress={retreiveFaceId}>
            Show my faceId
          </Button>
        ) : (
          <Text>{fvId}</Text>
        )}
      </Text>
      <Button
        onPress={() => {
          console.log("delete-fv");
        }}
      >
        TrashIconHere
      </Button>
    </Box>
  );
};

export const GoodIdModal = ({ children, account }: GoodIdModal) => {
  const { Modal, showModal } = useModal();

  useEffect(() => {
    showModal();
  }, [showModal]);

  return (
    <React.Fragment>
      <Modal header={<GoodIdHeader />} body={<GoodId account={account} />} onClose={noop} closeText="x" />
      {children}
    </React.Fragment>
  );
};
