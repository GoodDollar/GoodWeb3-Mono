import { Button, Modal } from "native-base";
import React, { useCallback, useState } from "react";

export const useModal = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return {
    modalVisible,
    showModal: useCallback(() => setModalVisible(true), []),
    hideModal: useCallback(() => setModalVisible(false), []),
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
      header?: any;
      body: any;
      footer?: any;
      actionText?: string;
      closeText: string;
      onClose?: () => void;
      onAction?: () => void;
      _modal?: any;
      _body?: any;
      _footer?: any;
      _header?: any;
    }) => {
      const actionButton = actionText ? (
        <Button
          onPress={() => {
            setModalVisible(false);
          }}
        >
          {actionText}
        </Button>
      ) : (
        <React.Fragment />
      );
      return (
        <Modal isOpen={modalVisible} onClose={setModalVisible} {..._modal}>
          <Modal.Content>
            {closeText && <Modal.CloseButton />}
            <Modal.Header {..._header}>{header}</Modal.Header>
            <Modal.Body {..._body}>{body}</Modal.Body>
            <Modal.Footer {..._footer}>
              <Button.Group space={2}>
                {closeText ? (
                  <Button
                    variant="ghost"
                    colorScheme="blueGray"
                    onPress={() => {
                      setModalVisible(false);
                    }}
                  >
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
