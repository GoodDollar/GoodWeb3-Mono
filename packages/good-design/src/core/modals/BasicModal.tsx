import { Button, Modal } from "native-base";
import React, { ReactNode, useCallback, useState } from "react";

export const useModal = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = useCallback(() => setModalVisible(true), [setModalVisible]);
  const hideModal = useCallback(() => setModalVisible(false), [setModalVisible]);

  return {
    modalVisible,
    showModal,
    hideModal,
    Modal: ({
      header,
      body,
      footer,
      actionText,
      closeText = "Cancel",
      onClose,
      onAction,
      _modal,
      _header,
      _body,
      _footer
    }: {
      header?: ReactNode;
      body: ReactNode;
      footer?: ReactNode;
      actionText?: string;
      closeText?: string;
      onClose?: () => void;
      onAction?: () => void;
      _modal?: any;
      _body?: any;
      _footer?: any;
      _header?: any;
    }) => {
      const onActionButtonPress = useCallback(() => {
        onAction?.();
        hideModal();
      }, [hideModal]);

      const _onClose = useCallback(() => {
        onClose?.();
        hideModal();
      }, [hideModal]);

      const actionButton = actionText ? (
        <Button onPress={onActionButtonPress}>{actionText}</Button>
      ) : (
        <React.Fragment />
      );

      return (
        <Modal isOpen={modalVisible} onClose={_onClose} {..._modal}>
          <Modal.Content>
            {closeText && <Modal.CloseButton />}
            <Modal.Header {..._header}>{header}</Modal.Header>
            <Modal.Body {..._body}>{body}</Modal.Body>
            <Modal.Footer {..._footer}>
              {footer}
              <Button.Group space={2}>
                {closeText ? (
                  <Button variant="ghost" colorScheme="blueGray" onPress={_onClose}>
                    {closeText}
                  </Button>
                ) : (
                  <></>
                )}
                {actionButton}
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      );
    }
  };
};
