import React, { Fragment } from "react";

import { withTheme } from "../../../theme";
import BasicStyledModal from "./BasicStyledModal";

// todo: add blurred background

export const LoaderModal = withTheme({ name: "BasicStyledModal" })(
  ({ overlay, loading, onClose }: { overlay: "dark" | "blur"; loading: boolean; onClose: () => void }) => (
    <Fragment>
      <BasicStyledModal
        type="loader"
        title={`We're checking \n your information...`}
        show={true}
        loading={loading}
        onClose={onClose}
        withCloseButton={false}
        withOverlay={overlay}
      />
    </Fragment>
  )
);
