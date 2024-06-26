import React, { useEffect, useState } from "react";
import { noop } from "lodash";
import { Text } from "native-base";

import BasicStyledModal, { ModalFooterSocial } from "./BasicStyledModal";

const ClaimSuccessContent = () => (
  <Text variant="sm-grey-650">
    Why not tell your friends on social media?
    <Text fontFamily="subheading" fontSize="sm" color="primary">
      Don't forget to tag use
    </Text>
  </Text>
);

export const ClaimSuccessModal = ({ open, onClose = noop, ...props }: { open: boolean; onClose?: () => void }) => {
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
      title={`Congrats! \n You claimed \n G$ today`}
      body={<ClaimSuccessContent />}
      footer={<ModalFooterSocial />}
      withOverlay="dark"
      withCloseButton
    />
  );
};
