import { noop } from "lodash";
import { Button, Modal as NBModal } from "native-base";
import React, { FC, ReactNode, useCallback } from "react";

export interface BasicModalProps {
  modalVisible: boolean;
  header?: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  actionText?: string;
  closeText?: string;
  hasCloseButton?: boolean;
  onClose?: () => void;
  onAction?: () => void;
  _modal?: any;
  _body?: any;
  _footer?: any;
  _header?: any;
}

export const BasicModal: FC<BasicModalProps> = ({
  modalVisible,
  header,
  body,
  footer,
  actionText,
  closeText = "Cancel",
  hasCloseButton = !!closeText,
  onClose = noop,
  onAction = noop,
  _modal,
  _header,
  _body,
  _footer
}) => {
  const onActionButtonPress = useCallback(() => {
    onAction();
    onClose();
  }, [onAction, onClose]);

  const actionButton = actionText ? <Button onPress={onActionButtonPress}>{actionText}</Button> : <React.Fragment />;

  return (
    /* height 100vh is required so modal always shows in the middle */
    <NBModal isOpen={modalVisible} onClose={onClose} {..._modal} minH="100vh">
      <NBModal.Content>
        {hasCloseButton && <NBModal.CloseButton />}
        <NBModal.Header {..._header}>{header}</NBModal.Header>
        <NBModal.Body {..._body}>{body}</NBModal.Body>
        <NBModal.Footer {..._footer}>
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
      </NBModal.Content>
    </NBModal>
  );
};
