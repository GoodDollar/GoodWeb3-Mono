import { EnvKey } from "./claim/sdk";

export const Envs: { [key: EnvKey]: { [key: string]: string } } = {
  production: {
    dappUrl: "https://wallet.gooddollar.org",
    identityUrl: "https://goodid.gooddollar.org"
  },
  staging: {
    dappUrl: "https://goodqa.netlify.app",
    identityUrl: "https://goodidqa.netlify.app"
  },
  fuse: {
    dappUrl: "https://gooddev.netlify.app",
    identityUrl: "https://fv-standalone--gooddev.netlify.app"
  }
};
