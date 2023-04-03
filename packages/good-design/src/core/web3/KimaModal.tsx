import React, { useEffect, useCallback } from "react";
import { useModal } from "../../hooks/useModal";
import { Box, Text } from "native-base";
import { LearnButton } from "../buttons";

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

const KimaModalCopy = (success: boolean, networks: BridgeNetworks) => ({
  header: (
    <Box backgroundColor={"white"}>
      <Text color="goodGrey.500" fontSize="sm" fontFamily="subheading">
        {success
          ? `You have succesfully bridged from ${networks.origin} to ${networks.destination}`
          : `Something went wrong while trying to bridge your tokens`}
      </Text>
    </Box>
  ),
  body: <LearnButton source="bridging" />
});

export const KimaModal = ({ success, networks, resetState, children }: KimaModalProps) => {
  const { Modal, showModal } = useModal();
  const kimaCopy = KimaModalCopy(success ?? false, networks);

  useEffect(() => {
    if (success !== undefined) {
      showModal();
    }
  }, [success, showModal]);

  const onClose = useCallback(() => {
    resetState();
  }, [resetState]);

  return (
    <React.Fragment>
      <Modal {...kimaCopy} onClose={onClose} closeText="x" />
      {children}
    </React.Fragment>
  );
};
