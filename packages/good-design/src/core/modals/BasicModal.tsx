import { noop } from "lodash";
import { Button, Modal as NBModal, useColorModeValue } from "native-base";
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
  onClose?: () => void;
  onAction?: () => void;
  _modal?: any;
  _body?: any;
  _footer?: any;
  _header?: any;
}

const BasicModal: FC<BasicModalProps> = ({
  modalVisible,
  header,
  body,
  footer,
  actionText,
  closeText = "Cancel",
  hasCloseButton = !!closeText,
  hasTopBorder = true,
  hasBottomBorder = true,
  onClose = noop,
  onAction = noop,
  _modal = {},
  _header = {},
  _body = {},
  _footer = {}
}) => {
  const backgroundColor = useColorModeValue("white", "mainDarkContrast");

  const onActionButtonPress = useCallback(() => {
    onAction();
    onClose();
  }, [onAction, onClose]);

  const actionButton = actionText ? <Button onPress={onActionButtonPress}>{actionText}</Button> : <React.Fragment />;
  return (
    /* height 100vh is required so modal always shows in the middle */
    <NBModal isOpen={modalVisible} onClose={onClose} {..._modal} minH="100vh" >
      <NBModal.Content bgColor={backgroundColor}>
        {hasCloseButton && <NBModal.CloseButton />}
        {!!header && (
          <NBModal.Header borderBottomWidth={hasTopBorder ? "px" : "0"} {..._header} bgColor={backgroundColor}>
            {header}
          </NBModal.Header>
        )}
        <NBModal.Body {..._body}>{body}</NBModal.Body>
        {(!!footer || !!closeText || !!actionText) && (
          <NBModal.Footer borderTopWidth={hasBottomBorder ? "px" : "0"} {..._footer} bgColor={backgroundColor}>
            {footer}
            <Button.Group space={2}>
              {closeText ? (
                <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
                  {closeText}
                </Button>
              ) : (
                <></>
              )}
              {actionButton}
            </Button.Group>
          </NBModal.Footer>
        )}
      </NBModal.Content>
    </NBModal>
  );
};

export default BasicModal;
