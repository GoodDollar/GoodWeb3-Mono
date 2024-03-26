import React, { useEffect } from "react";
import { Center, Text } from "native-base";

import { Image } from "../../images";
import { Title } from "../../layout";
import { useModal } from "../../../hooks";
import { LinkButton } from "../../buttons/StyledLinkButton";
import { LearnButton } from "../../buttons";
import { learnSources } from "../../buttons/LearnButton";
import { SpinnerCheckMark } from "../../animated";
import BillyCelebration from "../../../assets/svg/billy-celebration.svg";

export interface BasicModalProps {
  show: boolean;
  onClose: () => void;
  withOverlay?: "blur" | "dark";
  withCloseButton: boolean;
  title: string;
  modalStyle?: any;
  headerStyle?: any;
  bodyStyle?: any;
  footerStyle?: any;
  content?: string | JSX.Element;
  footer?: JSX.Element;
}

interface CtaOrLearnModalProps extends BasicModalProps {
  type: "cta" | "ctaX" | "learn" | "social";
  loading?: never;
}

interface AltModalProps extends BasicModalProps {
  type: "loader";
  loading: boolean;
}

export type StyledModalProps = CtaOrLearnModalProps | AltModalProps;

const ModalHeader = ({ title }: { title: string }) => (
  <Center backgroundColor="white" textAlign="center">
    <Title fontFamily="heading" color="primary" fontSize="xl" lineHeight="110%">
      {title}
    </Title>
  </Center>
);

const ModalBody = ({
  content,
  type,
  loading
}: {
  content: string | JSX.Element | undefined;
  type: string;
  loading?: boolean;
}) => (
  <Center padding={0}>
    {type === "loader" ? (
      <SpinnerCheckMark loading={loading ?? true} />
    ) : (
      <Text color="goodGrey.600" fontFamily="subheading" lineHeight={20} padding={0} fontSize="sm">
        {content}
      </Text>
    )}
  </Center>
);

export const ModalFooterCta = ({ buttonText, action }: { buttonText: string; action: () => void }) => (
  <Center padding="0" w="100%">
    <LinkButton buttonText={buttonText} onPress={action} />
  </Center>
);

export const ModalFooterCtaX = ({ extUrl, buttonText }: { extUrl: string; buttonText: string }) => (
  <Center padding="0" w="100%">
    <LinkButton buttonText={buttonText} url={extUrl} />
  </Center>
);

export const ModalFooterLearn = ({
  source,
  altSource = { link: "", label: "", icon: null }
}: {
  source?: learnSources;
  altSource?: { link: string; label: string; icon: any };
}) => (
  <Center padding="0" w="100%">
    <LearnButton {...(source ? { source: source } : { altSource: altSource })} />
  </Center>
);

export const ModalFooterSocial = () => (
  <Center padding="0" w="100%">
    <Center>
      <Image source={BillyCelebration} w={135} h={135} style={{ resizeMode: "contain" }} />
      {/* todo: add socials share bar */}
    </Center>
  </Center>
);

//todo: fix blur overlay

const BasicStyledModal = ({
  type,
  show = true,
  onClose,
  withOverlay,
  withCloseButton,
  title,
  content,
  footer,
  loading,
  modalStyle,
  headerStyle,
  bodyStyle,
  footerStyle
}: StyledModalProps) => {
  const { Modal, showModal, hideModal } = useModal();

  useEffect(() => {
    if (show) {
      showModal();
      return;
    }

    hideModal();
  }, [showModal, show]);

  return (
    <React.Fragment>
      <Modal
        _modalContainer={modalStyle}
        _header={headerStyle}
        _body={bodyStyle}
        _footer={footerStyle}
        {...(withCloseButton && { closeText: "x" })}
        type={type}
        onClose={onClose}
        withOverlay={withOverlay}
        header={<ModalHeader title={title} />}
        body={<ModalBody content={content} type={type} loading={loading} />}
        footer={footer}
      />
    </React.Fragment>
  );
};

export default BasicStyledModal;
