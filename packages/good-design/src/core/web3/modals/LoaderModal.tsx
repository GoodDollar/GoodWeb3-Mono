import React, { Fragment } from "react";

import { withTheme } from "../../../theme";
import BasicStyledModal, { ModalLoaderBody } from "./BasicStyledModal";

// todo: add blurred background

export const LoaderModal = withTheme({ name: "BasicStyledModal" })(
  ({
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
    <Fragment>
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
    </Fragment>
  )
);
