import React, { Fragment } from "react";

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
}) => (
  <Fragment>
    <BasicStyledModal
      {...props}
      type="cta"
      title="Oops!"
      show={true}
      onClose={onClose}
      withCloseButton={true}
      withOverlay={overlay}
      titleVariant="title-gdred"
      body={<ModalErrorBody error={error} />}
    />
  </Fragment>
);
