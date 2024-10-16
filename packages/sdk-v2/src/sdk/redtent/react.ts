import { useCallback } from "react";
import { useGetEnvChainId } from "../base";
import { Envs } from "../constants";
import { getDevEnv, g$Response, g$Request } from "../goodid/sdk";

export const useRegisterRedtent = () => {
  const { baseEnv } = useGetEnvChainId();
  const devEnv = getDevEnv(baseEnv);
  const { backend } = Envs[devEnv];

  const register = useCallback(
    async (data: { videoFilename: string; certificates: Array<any> }) =>
      fetch(`${backend}/goodid/redtent`, g$Request(data)).then(g$Response),
    [backend]
  );
  return register;
};
