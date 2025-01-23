import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";

import BasicStyledModal, { ModalErrorBody } from "./BasicStyledModal";

export const ErrorModal = ({
  error,
  overlay,
  onClose,
  ...props
}: {
  error: string;
  overlay: "dark" | "blur";
  onClose: () => void;
}) => {
  const [show, setShow] = useState<boolean>(false);

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    if (!isEmpty(error) && !show) {
      setShow(true);
    }
  }, [error]);

  return (
    <BasicStyledModal
      {...props}
      type="cta"
      title="Oops!"
      show={show}
      onClose={handleClose}
      withCloseButton={true}
      withOverlay={overlay}
      titleVariant="title-gdred"
      body={<ModalErrorBody error={error} />}
    />
  );
};
