import React from "react";
import { Link, Text, VStack } from "native-base";

import { useFVModalAction } from "../../../hooks/useFVModalAction";
import { withTheme } from "../../../theme";
import BasicStyledModal, { ModalFooterCta } from "./BasicStyledModal";
import { TxModal } from "./TxModal";

const ModalContent = () => (
  <VStack justifyContent="center" space={4} textAlign="center">
    <Text fontWeight="bold">{`You’re almost there! To claim G$, you need prove you are a unique human.`}</Text>
    <Text>
      {`You’ll be asked to sign with your wallet to begin the verification. You may have to do this again from time to time.`}
    </Text>
    <Link
      justifyContent="center"
      _text={{ color: "main" }}
      mt="5"
      href="https://docs.gooddollar.org/about-the-protocol/sybil-resistance"
      isExternal
    >
      Learn more
    </Link>
  </VStack>
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
