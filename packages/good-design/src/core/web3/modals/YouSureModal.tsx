import React, { useEffect, useState } from "react";

import { AsyncStorage } from "@gooddollar/web3sdk-v2";
import { Text } from "native-base";

import BasicStyledModal, { ModalFooterCta } from "./BasicStyledModal";

const youSureContent = {
  deleteAccount: {
    title: /*i18n*/ "Are you sure?",
    content:
      /*i18n*/ "This cannot be undone! \nAfter deleting your Face ID, you must wait 24 hours before going through the face verification flow again. After 24 hours, you can verify again by pressing the “claim” button.",
    buttonText: /*i18n*/ "Delete Account"
  },
  offers: {
    title: /*i18n*/ "Are you sure you want to skip this offer for now?",
    content: "",
    buttonText: /*i18n*/ "Skip"
  },
  transaction: {
    title: /*i18n*/ "Are you sure?",
    content: /*i18n*/ "Keep in mind that even unsuccessful and failed transactions cost you gas. ",
    buttonText: /*i18n*/ "Yes, try again"
  }
};

interface YouSureModalProps {
  open: boolean;
  type: keyof typeof youSureContent;
  dontShowAgainKey?: string | undefined;
  styleProps?: any;
  action: () => void;
  onClose: () => void;
}

/**
 * A modal that asks the user if they are sure about an action.
 * if no key is set, the modal will act as a general notice modal.
 * @param open - Whether the modal is open or not.
 * @param type - The type of the modal.
 * @param action - The action to be executed when the user confirms.
 * @param onClose - The action to be executed when the user closes the modal.
 * @param dontShowAgainKey (optional) - The key to store the user's preference of not showing the modal again.
 */
export const YouSureModal = ({ open, action, onClose, dontShowAgainKey, styleProps, ...props }: YouSureModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { buttonStyle } = styleProps || {};
  const { title, content, buttonText } = youSureContent[props.type as keyof typeof youSureContent];

  useEffect(() => {
    void (async () => {
      if (dontShowAgainKey) {
        const dontShowProp = await AsyncStorage.getItem(dontShowAgainKey);
        setDontShowAgain(dontShowProp === "true");
      }
    })();
  }, [/*used*/ open, dontShowAgainKey]);

  return (
    <BasicStyledModal
      {...props}
      type="ctaX"
      show={open && !dontShowAgain}
      onClose={onClose}
      title={title}
      body={<Text variant="sm-grey-650">{content}</Text>}
      footer={
        <ModalFooterCta
          action={action}
          buttonText={buttonText}
          dontShowAgainKey={dontShowAgainKey}
          dontShowAgainCopy={/*i18n*/ "Don't show this again"}
          styleProps={buttonStyle}
        />
      }
      withOverlay="dark"
      withCloseButton
    />
  );
};
