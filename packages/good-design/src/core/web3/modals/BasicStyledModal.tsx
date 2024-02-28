import React, { useEffect } from "react";
import { Center, Text } from "native-base";

import { Title } from "../../layout";
import { useModal } from "../../../hooks";
import { LinkButton } from "../../buttons/StyledLinkButton";
import { LearnButton } from "../../buttons";
import { learnSources } from "../../buttons/LearnButton";
import { CtaButton } from "../../buttons/CtaButton";
import { SpinnerCheckMark } from "../../animated";

const altModalTypes = ["loader", "other"];

interface BasicModalProps {
  show: boolean;
  onClose: () => void;
  withOverlay?: "blur" | "dark";
  withCloseButton: boolean;
  title: string;
  content?: string;
  buttonText?: string;
}

interface CtaOrLearnModalProps extends BasicModalProps {
  type: "cta" | "ctaX" | "learn";
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
    <Title fontFamily="heading" color="primary" fontSize="xl" width="50%" lineHeight="110%">
      {title}
    </Title>
  </Center>
);

const ModalBody = ({ content, type, loading }: { content: string | undefined; type: string; loading?: boolean }) => (
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
  altSource = { link: "", label: "" }
}: {
  type: string;
  action?: () => void;
  extUrl?: string;
  buttonText?: string;
  source?: learnSources;
  altSource?: { link: string; label: string };
}) => (
  <Center padding="0" w="100%">
    {type === "cta" && action && buttonText ? <CtaButton text={buttonText} onPress={action} /> : null}
    {type === "ctaX" && extUrl && buttonText ? <LinkButton url={extUrl} extButtonText={buttonText} /> : null}
    {type === "learn" ? <LearnButton {...(source ? { source: source } : { altSource: altSource })} /> : null}
    {/* todo: add socials */}
  </Center>
);

export const BasicStyledModal = ({
  type,
  show = true,
  onClose,
  withOverlay,
  withCloseButton,
  extUrl,
  title,
  content,
  buttonText,
  loading
}: StyledModalProps) => {
  const { Modal, showModal } = useModal();
  const isAltModal = altModalTypes.includes(type);

  // todo: add handling of open/close modal
  useEffect(() => {
    if (show) {
      showModal();
    }
  }, [showModal, show]);

  return (
    <React.Fragment>
      <Modal
        _modalContainer={{ maxWidth: 343, paddingX: 4, paddingY: 6, maxHeight: "auto" }}
        _header={{ padding: 0 }}
        _body={{ padding: 0, textAlign: "left" }}
        _footer={{ justifyContent: "center" }}
        {...(withCloseButton && { closeText: "x" })}
        type={type}
        onClose={onClose}
        withOverlay={withOverlay}
        header={<ModalHeader title={title} />}
        body={<ModalBody content={content} type={type} loading={loading} />}
        {...(!isAltModal && {
          footer: <ModalFooter type={type} extUrl={extUrl} buttonText={buttonText} />
        })}
      />
    </React.Fragment>
  );
};
