import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { noop as _ } from "lodash";

export default () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const active = useMemo(() => appState === "active", [appState]);

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [setAppState]);

  return { appState, active };
};
