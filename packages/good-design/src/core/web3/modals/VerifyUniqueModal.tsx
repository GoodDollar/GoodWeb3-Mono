import React from "react";
import { Link, Text } from "native-base";

import { useFVModalAction } from "../../../hooks/useFVModalAction";
import BasicStyledModal, { ModalFooterCta } from "./BasicStyledModal";
import { TxModal } from "./TxModal";

const ModalContent = () => (
  <Text variant="sm-grey-650">
    You're almost there! To claim G$, you need to be a unique human and prove it with your camera.
    <Link
      _text={{ color: "main" }}
      mt="5"
      href="https://www.notion.so/gooddollar/Get-G-873391f31aee4a18ab5ad7fb7467acb3"
      isExternal
    >
      Learn more about the identification process.
    </Link>
    {`
      
Verifying your identity is easy. You'll be asked to sign with your wallet.

Don't worry, no link is kept between your identity record and your wallet address.
      `}
  </Text>
);

export const VerifyUniqueModal = ({ open, url, onClose, chainId, firstName, method, ...props }: any) => {
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
};
