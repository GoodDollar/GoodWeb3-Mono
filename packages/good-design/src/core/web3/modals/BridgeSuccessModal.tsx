import React, { useEffect, useState } from "react";
import { noop } from "lodash";
import { Text, VStack } from "native-base";

import { Image } from "../../images";
import BasicStyledModal from "./BasicStyledModal";

import BillyHearts from "../../../assets/images/billy-hearts.png";

export const BridgeSuccessContent = () => (
  <VStack space={6} justifyContent="center" alignItems="center">
    <Image source={BillyHearts} w={137} h={135} style={{ resizeMode: "contain" }} />
    <Text>Your bridging process is complete.</Text>
  </VStack>
);

export const BridgeSuccessModal = ({ open, onClose = noop, ...props }: { open: boolean; onClose?: () => void }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // the open prop is expected to be only true when transaction state is success.
    // this resets pretty quickly which is why we cannot use it directly for triggering the modal
    if (open) {
      setShow(true);
    }
  }, [open]);

  return (
    <BasicStyledModal
      {...props}
      type="social"
      show={show}
      onClose={onClose}
      title={`Congratulations!`}
      body={<BridgeSuccessContent />}
      withOverlay="dark"
      withCloseButton
    />
  );
};
