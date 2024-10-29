import React from "react";
import { Link } from "native-base";

import { useFVModalAction } from "../../../hooks/useFVModalAction";
import { withTheme } from "../../../theme";
import BasicStyledModal, { ModalFooterCta } from "./BasicStyledModal";
import { TxModal } from "./TxModal";

const ModalContent = () => (
  <>
    You're almost there! To claim G$, you need to be a unique human and prove it with your camera.
    <Link
      _text={{ color: "main" }}
      mt="5"
      href="https://docs.gooddollar.org/about-the-protocol/sybil-resistance"
      isExternal
    >
      Learn more.
    </Link>
    {`
      
You’re almost there! To claim G$, you need prove you are a unique human.

You’ll be asked to sign with your wallet to begin the verification.
You may have to do this again from time to time.
      `}
  </>
);

export const VerifyUniqueModal = withTheme({ name: "BasicStyledModal" })(
  ({ open, url, onClose, chainId, firstName, method, ...props }: any) => {
    const { loading, verify } = useFVModalAction({
      firstName,
      method,
      chainId,
      onClose: onClose,
      redirectUrl: url
    });

    return (
      <>
        {!loading ? (
          <BasicStyledModal
            {...props}
            type="cta"
            show={open}
            onClose={onClose}
            title={`Verify \n Uniqueness`}
            body={<ModalContent />}
            footer={<ModalFooterCta buttonText="VERIFY I'M HUMAN" action={verify} />}
            withOverlay="dark"
            withCloseButton
          />
        ) : (
          <TxModal type="sign" isPending={loading} />
        )}
      </>
    );
  }
);
