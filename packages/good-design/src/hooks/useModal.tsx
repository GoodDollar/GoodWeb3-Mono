import { noop, over } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { BasicModalProps, BasicModal } from "../core/modals";

export const useModal = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = useCallback(() => setModalVisible(true), [setModalVisible]);
  const hideModal = useCallback(() => setModalVisible(false), [setModalVisible]);

  const MemoizedModal = useMemo(
    () =>
      ({ onClose = noop, ...props }: Omit<BasicModalProps, "modalVisible">) =>
        <BasicModal {...props} modalVisible={modalVisible} onClose={over(onClose, hideModal)} />,
    [modalVisible, hideModal]
  );

  return {
    modalVisible,
    showModal,
    hideModal,
    Modal: MemoizedModal
  };
};
