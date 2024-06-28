import React, { useEffect, useState } from "react";
import { Center, Checkbox, HStack, Text, VStack } from "native-base";

import { withTheme } from "../../../theme/hoc/withTheme";
import { Image } from "../../images";
import { Title } from "../../layout";
import { useModal } from "../../../hooks";
import { LinkButton } from "../../buttons/StyledLinkButton";
import { LearnButton } from "../../buttons";
import { learnSources } from "../../buttons/LearnButton";
import { SpinnerCheckMark } from "../../animated";
import BillyCelebration from "../../../assets/images/billy-celebration.png";
import BillyOops from "../../../assets/images/billy-oops.png";
import { AsyncStorage } from "@gooddollar/web3sdk-v2";

export interface BasicModalProps {
  show: boolean;
  onClose: () => void;
  withOverlay?: "blur" | "dark";
  withCloseButton: boolean;
  title: string;
  modalStyle?: any;
  headerStyle?: any;
  titleVariant?: string;
  bodyStyle?: any;
  footerStyle?: any;
  body?: JSX.Element;
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

const ModalHeader = ({ title, variant = "title-gdblue" }: { title: string; variant: any }) => (
  <Center backgroundColor="white" textAlign="center" paddingBottom={0}>
    <Title variant={variant} fontSize="xl">
      {title}
    </Title>
  </Center>
);

export const ModalLoaderBody = () => (
  <Center padding={0}>
    <SpinnerCheckMark />
  </Center>
);

export const ModalErrorBody = ({ error }: { error: string }) => (
  <VStack space={6} justifyContent="center" alignItems="center">
    <Image source={BillyOops} w={137} h={135} style={{ resizeMode: "contain" }} />
    <Text variant="sm-grey-650" color="goodRed.100">
      {error}
    </Text>
  </VStack>
);

export const ModalFooterCta = ({
  buttonText,
  withDontShowAgain,
  action,
  styleProps
}: {
  buttonText: string;
  withDontShowAgain?: string | undefined;
  styleProps?: any;
  action: () => void;
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const onAction = async () => {
    if (withDontShowAgain && dontShowAgain) {
      await AsyncStorage.setItem(withDontShowAgain, "true");
    }

    action();
  };

  return (
    <Center padding="0" w="100%">
      {withDontShowAgain ? (
        <HStack space={2}>
          <Checkbox
            variant="styled-blue"
            onChange={() => setDontShowAgain(prev => !prev)}
            colorScheme="info"
            value="female"
          />
          <Text variant="sm-grey-600"> Don't show this again</Text>
        </HStack>
      ) : null}
      <LinkButton buttonText={buttonText} onPress={onAction} {...styleProps} />
    </Center>
  );
};

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

const BasicStyledModal = withTheme({ name: "BasicStyledModal", skipProps: ["body", "footer"] })(
  ({
    type,
    show = true,
    onClose,
    withOverlay,
    withCloseButton,
    title,
    body,
    footer,
    modalStyle,
    headerStyle,
    titleVariant,
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
          header={<ModalHeader title={title} variant={titleVariant} />}
          body={body}
          footer={footer}
        />
      </React.Fragment>
    );
  }
);

export default BasicStyledModal;
