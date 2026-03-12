import { useCallback, useState } from "react";

export const useMPBBridgeUiState = () => {
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [toggleState, setToggleState] = useState<boolean>(false);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [txDetailsOpen, setTxDetailsOpen] = useState(false);
  const [txDetails, setTxDetails] = useState<any | undefined>();

  const onTxDetailsPress = useCallback((tx: any) => {
    setTxDetails(tx);
    setTxDetailsOpen(true);
  }, []);

  const onTxDetailsClose = useCallback(() => setTxDetailsOpen(false), []);

  const closeAllDropdowns = useCallback(() => {
    setShowSourceDropdown(false);
    setShowTargetDropdown(false);
  }, []);

  return {
    showSourceDropdown,
    setShowSourceDropdown,
    showTargetDropdown,
    setShowTargetDropdown,
    toggleState,
    setToggleState,
    successModalOpen,
    setSuccessModalOpen,
    errorMessage,
    setErrorMessage,
    txDetailsOpen,
    txDetails,
    setTxDetails,
    setTxDetailsOpen,
    onTxDetailsPress,
    onTxDetailsClose,
    closeAllDropdowns
  };
};
