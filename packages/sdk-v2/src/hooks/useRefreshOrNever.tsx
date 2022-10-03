import { noop as _ } from "lodash";
import { QueryParams } from "@usedapp/core";
import useAppState from "./useAppState";

export default (refresh: QueryParams["refresh"]) => {
  const { appState } = useAppState();
  return appState === "active" ? refresh : "never";
};
