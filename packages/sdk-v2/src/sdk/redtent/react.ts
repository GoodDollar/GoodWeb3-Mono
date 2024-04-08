import { useCallback } from "react";
import { useGetEnvChainId } from "../base";
import { Envs } from "../constants";

export const useRegisterRedtent = () => {
  const { baseEnv } = useGetEnvChainId();
  const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
  const { backend } = Envs[devEnv];

  const register = useCallback(
    async (data: { account: string; videoFilename: string; credentials: Array<any> }) => {
      const res = await fetch(backend + "/goodid/redtent", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return res.json();
      }
      throw new Error(`Redtent request failed: ${res.statusText} (${res.status})`);
    },
    [backend]
  );
  return register;
};
