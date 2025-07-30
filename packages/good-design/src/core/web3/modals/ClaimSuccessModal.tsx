import React, { useEffect, useState } from "react";
import { noop } from "lodash";
import { Text } from "native-base";

import BasicStyledModal, { ModalFooterSocial } from "./BasicStyledModal";

const ClaimSuccessContent = ({ isFirstTimeClaimer = false }: { isFirstTimeClaimer?: boolean }) => (
  <Text variant="sm-grey-650">
    {isFirstTimeClaimer
      ? "Why not tell your friends about your first G$ claim?"
      : "Why not tell your friends on social media?"}
    <Text fontFamily="subheading" fontSize="sm" color="gdPrimary">
      {` Don't forget to tag us`}
    </Text>
  </Text>
);

export interface ClaimSuccessModalProps {
  open: boolean;
  onClose?: () => void;
  isFirstTimeClaimer?: boolean;
  socialShareMessage?: string;
  socialShareUrl?: string;
}

export const ClaimSuccessModal = ({
  open,
  onClose = noop,
  isFirstTimeClaimer = false,
  socialShareMessage = "I just did my first claim(s) of G$ this week!",
  socialShareUrl = "https://gooddollar.org",
  ...props
}: ClaimSuccessModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // the open prop is expected to be only true when transaction state is success.
    // this resets pretty quickly which is why we cannot use it directly for triggering the modal
    if (open) {
      setShow(true);
    }
  }, [open]);

  const title = isFirstTimeClaimer
    ? "Congrats! \n You claimed your \n first G$'s today"
    : "Congrats! \n You claimed \n G$ today";

  return (
    <BasicStyledModal
      {...props}
      type="social"
      show={show}
      onClose={onClose}
      title={title}
      body={<ClaimSuccessContent isFirstTimeClaimer={isFirstTimeClaimer} />}
      footer={
        isFirstTimeClaimer ? (
          <ModalFooterSocial message={socialShareMessage} url={socialShareUrl} />
        ) : (
          <ModalFooterSocial />
        )
      }
      withOverlay="dark"
      withCloseButton
    />
  );
};
