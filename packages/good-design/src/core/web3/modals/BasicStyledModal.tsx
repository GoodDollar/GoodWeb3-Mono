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

const altModalTypes = ["loader", "other"];

interface BasicModalProps {
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
  buttonText?: string;
  buttonAction?: () => void;
  learnSource?: learnSources;
  altLearnSource?: { link: string; label: string; icon: any };
}

interface CtaOrLearnModalProps extends BasicModalProps {
  type: "cta" | "ctaX" | "learn" | "social";
  extUrl?: string;
  loading?: never;
}

interface AltModalProps extends BasicModalProps {
  type: "loader";
  loading: boolean;
  extUrl?: never;
}

type StyledModalProps = CtaOrLearnModalProps | AltModalProps;

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

const ModalFooter = ({
  type,
  action,
  extUrl,
  buttonText,
  source,
  altSource = { link: "", label: "", icon: null }
}: {
  type: string;
  action?: () => void;
  extUrl?: string;
  buttonText?: string;
  source?: learnSources;
  altSource?: { link: string; label: string; icon: any };
}) => (
  <Center padding="0" w="100%">
    {type === "cta" && action && buttonText ? <LinkButton buttonText={buttonText} onPress={action} /> : null}
    {type === "ctaX" && extUrl && buttonText ? <LinkButton url={extUrl} buttonText={buttonText} /> : null}
    {type === "learn" ? <LearnButton {...(source ? { source: source } : { altSource: altSource })} /> : null}
    {type === "social" ? (
      <Center>
        <Image source={BillyCelebration} w={135} h={135} style={{ resizeMode: "contain" }} />
        {/* todo: add socials share bar */}
      </Center>
    ) : null}
  </Center>
);

const BasicStyledModal = ({
  type,
  show = true,
  onClose,
  withOverlay,
  withCloseButton,
  extUrl,
  title,
  content,
  buttonText,
  buttonAction,
  learnSource,
  altLearnSource,
  loading,
  modalStyle,
  headerStyle,
  bodyStyle,
  footerStyle
}: StyledModalProps) => {
  const { Modal, showModal, hideModal } = useModal();
  const isAltModal = altModalTypes.includes(type);

  // todo: add handling of open/close modal
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
        {...(!isAltModal && {
          footer: (
            <ModalFooter
              type={type}
              extUrl={extUrl}
              buttonText={buttonText}
              action={buttonAction}
              source={learnSource}
              altSource={altLearnSource}
            />
          )
        })}
      />
    </React.Fragment>
  );
};

export default BasicStyledModal;
