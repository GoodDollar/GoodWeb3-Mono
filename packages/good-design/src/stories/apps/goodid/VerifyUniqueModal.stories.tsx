import React, { useState } from "react";
import { VerifyUniqueModal } from "../../../core/web3/modals/VerifyUniqueModal";
import { W3Wrapper } from "../../W3Wrapper";

const VerifyModalWrapper = ({ open, url, chainId, firstName, method }) => {
  const [showModal, setShowModal] = useState(open);

  return (
    <W3Wrapper withMetaMask={true}>
      <VerifyUniqueModal
        open={showModal}
        url={url}
        onClose={() => setShowModal(false)}
        chainId={chainId}
        firstName={firstName}
        method={method}
      />
    </W3Wrapper>
  );
};

export default {
  title: "Core/Modals",
  component: VerifyModalWrapper,
  argTypes: {
    open: {
      description: "toggle modal",
      control: {
        type: "inline-radio",
        options: [true, false]
      }
    },
    url: {
      description: "url to redirect back to after FaceVerification"
    },
    chainId: {
      description: "which chainid to do the FaceVerification on"
    },
    firstName: {
      description: "Placeholder, not in use"
    },
    method: {
      description: "which method to do the FaceVerification with: popup or redirect"
    }
  }
};

export const VerifyModal = {
  args: {
    url: "http://localhost:6006",
    chainId: 42220,
    firstName: "test",
    method: "redirect"
  }
};
