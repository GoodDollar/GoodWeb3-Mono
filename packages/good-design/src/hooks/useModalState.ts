import { useCallback, useState } from "react";

type ModalStateReturnType = [boolean, () => void, () => void];

export const useModalState = (initialState = false): ModalStateReturnType => {
  const [state, setState] = useState(initialState);

  const open = useCallback(() => setState(true), [setState]);

  const close = useCallback(() => setState(false), [setState]);

  return [state, open, close];
};
