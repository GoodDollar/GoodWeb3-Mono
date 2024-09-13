import React, { useEffect, useState } from "react";
import { Center, Checkbox, HStack, Text, VStack } from "native-base";
import { AsyncStorage } from "@gooddollar/web3sdk-v2";
import { Trans } from "@lingui/react";

import { withTheme } from "../../../theme/hoc/withTheme";
import { Image } from "../../images";
import { TransText, TransTitle } from "../../layout";
import { useModal } from "../../../hooks";
import { LinkButton } from "../../buttons/StyledLinkButton";

import { SpinnerCheckMark } from "../../animated";
import BillyCelebration from "../../../assets/images/billy-celebration.png";
import BillyOops from "../../../assets/images/billy-oops.png";

const LocalText = ({ ...props }) => <Text {...props} />;

export interface BasicModalProps {
  show: boolean;
  onClose: () => void;
  withOverlay?: "blur" | "dark";
  withCloseButton: boolean;
  title: any;
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

const ModalHeader = ({ title, variant = "title-gdblue" }: { title: any; variant: any }) => {
  const transTitle = typeof title === "object" ? title.title : { id: title, values: {} };

  return (
    <Center backgroundColor="white" textAlign="center" paddingBottom={0}>
      <TransTitle t={transTitle.id} variant={variant} fontSize="xl" values={transTitle.values} />
    </Center>
  );
};

export const ModalLoaderBody = () => (
  <Center padding={0}>
    <SpinnerCheckMark />
  </Center>
);

export const ModalErrorBody = ({ error }: { error: string }) => (
  <VStack space={6} justifyContent="center" alignItems="center">
    <Image source={BillyOops} w={137} h={135} style={{ resizeMode: "contain" }} />
    <TransText textAlign="center" variant="sm-grey-650" color="goodRed.100" t={error} />
  </VStack>
);

export const ModalFooterCta = ({
  buttonText,
  dontShowAgainKey,
  action,
  dontShowAgainCopy,
  styleProps
}: {
  buttonText: string;
  dontShowAgainKey?: string | undefined;
  styleProps?: any;
  dontShowAgainCopy?: string;
  action: () => void;
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const onAction = async () => {
    if (dontShowAgainKey && dontShowAgain) {
      await AsyncStorage.setItem(dontShowAgainKey, "true");
    }

    action();
  };

  return (
    <VStack padding="0" w="100%">
      {dontShowAgainKey ? (
        <HStack space={2} alignItems="flex-start" justifyContent="flex-start">
          <Checkbox
            variant="styled-blue"
            onChange={() => setDontShowAgain(prev => !prev)}
            colorScheme="info"
            value="dontShowAgain"
          >
            <LocalText variant="sm-grey-650" style={{ userSelect: "none" }}>
              <Trans id={dontShowAgainCopy ?? ""}>{dontShowAgainCopy}</Trans>
            </LocalText>
          </Checkbox>
        </HStack>
      ) : null}
      <LinkButton mt={6} buttonText={buttonText} onPress={onAction} {...styleProps} />
    </VStack>
  );
};

export const ModalFooterCtaX = ({ extUrl, buttonText }: { extUrl: string; buttonText: string }) => (
  <Center padding="0" w="100%">
    <LinkButton buttonText={buttonText} url={extUrl} />
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
