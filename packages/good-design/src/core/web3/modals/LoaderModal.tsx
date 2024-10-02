import React from "react";

import BasicStyledModal, { ModalLoaderBody } from "./BasicStyledModal";

// todo: add blurred background

export const LoaderModal = ({
  title,
  overlay,
  loading,
  onClose
}: {
  title: string;
  overlay: "dark" | "blur";
  loading: boolean;
  onClose: () => void;
}) => (
  <BasicStyledModal
    type="loader"
    title={title}
    show={true}
    loading={loading}
    onClose={onClose}
    withCloseButton={false}
    withOverlay={overlay}
    body={<ModalLoaderBody />}
  />
);
