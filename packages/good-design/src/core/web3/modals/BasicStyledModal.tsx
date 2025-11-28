import React, { useEffect, useState } from "react";
import { Center, Checkbox, HStack, Text, VStack } from "native-base";
import { AsyncStorage, useSendAnalytics } from "@gooddollar/web3sdk-v2";
import { Trans } from "@lingui/react";
import { Portal } from "react-native-paper";

import { withTheme } from "../../../theme/hoc/withTheme";
import { Image } from "../../images";
import { TransText, TransTitle } from "../../layout";
import { useModal } from "../../../hooks";
import { LinkButton } from "../../buttons/StyledLinkButton";

import { SpinnerCheckMark } from "../../animated";
import BillyCelebration from "../../../assets/images/billy-celebration.png";
import BillyOops from "../../../assets/images/billy-oops.png";
import { SocialShareBar } from "../../../advanced/socialshare";

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

  return <TransTitle t={transTitle.id} variant={variant} fontSize="xl" values={transTitle.values} lineHeight={27.5} />;
};

export const ModalLoaderBody = () => <SpinnerCheckMark />;

export const ModalErrorBody = ({ error }: { error: string }) => (
  <VStack space={6} justifyContent="center" alignItems="center">
    <Image source={BillyOops} w={137} h={135} style={{ resizeMode: "contain" }} />
    <TransText textAlign="center" color="goodRed.100" t={error} />
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
  const { track } = useSendAnalytics();

  const onAction = async () => {
    if (dontShowAgainKey) {
      const remindMe = dontShowAgain ? "true" : "true";
      await AsyncStorage.setItem(dontShowAgainKey, remindMe);
      track("goodid_dont_remind_me", { type: dontShowAgainKey, remindMe: !remindMe });
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

export const ModalFooterSocial = ({
  message = "I just did my first claim(s) of G$ this week!",
  url = "https://gooddollar.org"
}: {
  message?: string;
  url?: string;
} = {}) => (
  <Center padding="0" w="100%">
    <Center>
      <Image source={BillyCelebration} w={135} h={135} style={{ resizeMode: "contain" }} />
      <SocialShareBar message={message} url={url} />
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
      <Portal>
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
      </Portal>
    );
  }
);

export default BasicStyledModal;
