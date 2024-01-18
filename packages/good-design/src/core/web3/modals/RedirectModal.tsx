import React, { useEffect } from "react";
import { Link, Text, useBreakpointValue } from "native-base";

import { useModal } from "../../../hooks/useModal";
import { Title } from "../../layout";
import { CentreBox } from "../../layout/CentreBox";

interface RedirectModalProps {
  modalProps: any;
  onClose?: () => void;
  children: any;
}

const RedirectButton = ({ url }: { url: string }) => (
  <CentreBox flexDir="row" justifyContent="center" mt="4" w="100%">
    <Link
      href={url}
      isExternal={true}
      isUnderlined={false}
      fontSize="sm"
      color="main"
      bg="primary"
      borderRadius="24"
      paddingY="10px"
      justifyContent="center"
      w="100%"
    >
      <Text textAlign="center" fontFamily="subheading" color="white" fontSize="sm">
        {`Go to website`}
      </Text>
    </Link>
  </CentreBox>
);

export const RedirectContent = () => {
  const titleStyles = useBreakpointValue({
    base: { fontSize: "xl", mb: "4" },
    lg: { fontSize: "xl", mb: "6" }
  });

  return (
    <CentreBox backgroundColor="white" borderRadius="20">
      <Title {...titleStyles} color="main" lineHeight="36px">
        {`Redirect Notice`}
      </Title>
      <CentreBox flexDir="column" justifyContent="flex-start">
        <Text textAlign="center" fontFamily="subheading" fontSize="sm">
          {`By accessing this link you are leaving`}
        </Text>
        <CentreBox flexDirection="row">
          <Text fontWeight="bold" textAlign="center" fontFamily="subheading" fontSize="sm">
            {`gooddapp.org `}
          </Text>
          <Text fontFamily="subheading" fontSize="sm">{`and are being redirected to a `}</Text>
        </CentreBox>
        <Text fontFamily="subheading" fontSize="sm">{`third-party, independent website.`}</Text>
      </CentreBox>
    </CentreBox>
  );
};

export const RedirectModal = ({ modalProps, children }: RedirectModalProps) => {
  const { Modal, showModal } = useModal();
  const { open, url, onClose } = modalProps;

  useEffect(() => {
    if (open) {
      showModal();
    }
  }, [showModal, open]);

  return (
    <React.Fragment>
      <Modal
        _modalContainer={{ maxWidth: 343, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}
        body={<RedirectContent />}
        footer={<RedirectButton url={url} />}
        onClose={onClose}
        closeText="x"
        _footer={{ justifyContent: "center" }}
      />
      {children}
    </React.Fragment>
  );
};
