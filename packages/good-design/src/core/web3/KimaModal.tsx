import React, { useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Box, Text } from "native-base";
import { LearnButton } from "../buttons";
import { Title } from "../layout";

type BridgeNetworks = {
  origin: string;
  destination: string;
};

interface KimaModalProps {
  success: boolean | undefined;
  networks: BridgeNetworks;
  resetState: any;
  children: any;
}

const KimaModalHeader = ({ success, networks }: { success: boolean; networks: BridgeNetworks }) => (
  <Box backgroundColor={"white"}>
    <Title mb="2" color="main" fontSize="xl" lineHeight="36px">
      {success ? `Success!` : `Oops!`}
    </Title>
    <Text color="goodGrey.500" fontSize="sm" fontFamily="subheading">
      {success
        ? `You have succesfully bridged from ${networks.origin} to ${networks.destination}`
        : `Something went wrong while trying to bridge your tokens`}
    </Text>
  </Box>
);

export const KimaModal = ({ success, networks, resetState, children }: KimaModalProps) => {
  const { Modal, showModal } = useModal();

  useEffect(() => {
    if (success !== undefined) {
      showModal();
    }
  }, [success, showModal]);

  return (
    <React.Fragment>
      <Modal
        header={<KimaModalHeader success={success ?? false} networks={networks} />}
        body={<LearnButton source="bridging" />}
        onClose={resetState}
        closeText="x"
      />
      {children}
    </React.Fragment>
  );
};
