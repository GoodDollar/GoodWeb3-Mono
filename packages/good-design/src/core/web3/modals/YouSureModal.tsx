import React from "react";

import { Text } from "native-base";
import BasicStyledModal, { ModalFooterCta } from "./BasicStyledModal";

const youSureContent = {
  deleteAccount: {
    title: "Are you sure?",
    content:
      "This cannot be undone! \nYou must wait 24 hours after deleting your FaceID before going through the Face Verification flow by clicking on the Claim button.",
    buttonText: "Delete Account"
  },
  offers: {
    title: "Are you sure you want to skip this offer for now?",
    content: "",
    buttonText: "Skip"
  },
  transaction: {
    title: "Are you sure?",
    content: "Keep in mind that even unsuccessful and failed transactions cost you gas. ",
    buttonText: "Yes, try again"
  }
};

interface YouSureModalProps {
  open: boolean;
  type: keyof typeof youSureContent;
  withDontShowAgain?: string | undefined;
  styleProps?: any;
  action: () => void;
  onClose: () => void;
}

export const YouSureModal = ({
  open,
  type,
  action,
  onClose,
  withDontShowAgain,
  styleProps,
  ...props
}: YouSureModalProps) => {
  const { title, content, buttonText } = youSureContent[type as keyof typeof youSureContent];
  const { buttonStyle } = styleProps || {};
  return (
    <BasicStyledModal
      {...props}
      type="ctaX"
      show={open}
      onClose={onClose}
      title={title}
      body={<Text variant="sm-grey-650">{content}</Text>}
      footer={
        <ModalFooterCta
          action={action}
          buttonText={buttonText}
          withDontShowAgain={withDontShowAgain}
          styleProps={buttonStyle}
        />
      }
      withOverlay="dark"
      withCloseButton
    />
  );
};
