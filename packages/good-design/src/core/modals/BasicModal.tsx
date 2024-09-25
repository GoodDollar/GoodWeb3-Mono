import { noop } from "lodash";
import { Button, Center, Modal as NBModal, useColorModeValue, VStack } from "native-base";
import React, { FC, ReactNode, useCallback } from "react";

export interface BasicModalProps {
  modalVisible: boolean;
  header?: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  actionText?: string;
  closeText?: string;
  hasCloseButton?: boolean;
  hasTopBorder?: boolean;
  hasBottomBorder?: boolean;
  bgColor?: string;
  type?: string;
  withOverlay?: string;
  onClose?: () => void;
  onAction?: () => void;
  _modal?: any;
  _modalContainer?: any;
  _body?: any;
  _footer?: any;
  _header?: any;
}

const CloseButton = () => (
  <NBModal.CloseButton
    padding={0}
    width={6}
    height={6}
    justifyContent="center"
    alignItems={"center"}
    position="relative"
    top="0"
    left="0"
    right="0"
    bottom="0"
    _icon={{ size: 5 }}
  />
);

const BasicModal: FC<BasicModalProps> = ({
  modalVisible,
  header,
  body,
  footer,
  actionText,
  closeText,
  hasCloseButton = !!closeText,
  hasTopBorder = true,
  hasBottomBorder = true,
  onClose = noop,
  onAction = noop,
  withOverlay,
  bgColor = "white",
  _modal = {},
  _modalContainer = {},
  _header = {},
  _body = {},
  _footer = {}
}) => {
  const onActionButtonPress = useCallback(() => {
    onAction();
    onClose();
  }, [onAction, onClose]);

  const overlayDark = useColorModeValue("mainDarkContracts:alpha.40", "white:alpha.40");
  const overlayBlur = "purple.300"; //todo: add blur overlay

  const bgOverlay = withOverlay === "dark" ? overlayDark : withOverlay === "blur" ? overlayBlur : "transparent";

  const actionButton = actionText ? <Button onPress={onActionButtonPress}>{actionText}</Button> : <React.Fragment />;

  return (
    /* height 100vh is required so modal always shows in the middle */
    <NBModal isOpen={modalVisible} onClose={onClose} {..._modal} minH="100vh" bgColor={bgOverlay}>
      <NBModal.Content {..._modalContainer} w={"100%"} bgColor={bgColor}>
        {hasCloseButton && (
          <Center marginLeft="auto">
            <CloseButton />
          </Center>
        )}
        <VStack space={6}>
          {!!header && (
            <NBModal.Header backgroundColor={bgColor} borderBottomWidth={hasTopBorder ? 1 : 0} {..._header}>
              {header}
            </NBModal.Header>
          )}

          <NBModal.Body {..._body} bgColor={bgColor}>
            {body}
          </NBModal.Body>
        </VStack>
        <VStack paddingTop={6}>
          {(!!footer || !!actionText) && (
            <NBModal.Footer borderTopWidth={hasBottomBorder ? 1 : 0} {..._footer} padding="0" bgColor={bgColor}>
              {footer}
              <Button.Group space={2}>{actionButton}</Button.Group>
            </NBModal.Footer>
          )}
        </VStack>
      </NBModal.Content>
    </NBModal>
  );
};

export default BasicModal;
