import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { noop as _ } from "lodash";

export default () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

  return { appState };
};
