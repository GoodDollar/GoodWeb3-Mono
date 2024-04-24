import { providers, Signer } from "ethers";
import { FV_IDENTIFIER_MSG2, Envs } from "../constants";
import { EnvKey } from "../base";
import { CertificateItem } from "./types";

export const getDevEnv = (baseEnv: string) => (baseEnv === "fuse" ? "development" : baseEnv);

export const g$Response = (fetchResponse: Response) => {
  if (!fetchResponse.ok) {
    void fetchResponse.json().then(({ error }) => {
      const errorMessage = error ?? "Unknown GoodServer error";
      throw new Error(errorMessage);
    });
  }

  return fetchResponse.json();
};

/**
 * Use for regular requests to gooddollar server
 * @param json
 * @param method
 * @param headers
 * @returns
 */
export const g$Request = (json: any, method = "POST", headers = {}) => ({
  method,
  headers: { ...headers, "content-type": "application/json" },
  body: JSON.stringify(json)
});

/**
 * * Use for requests that require authentication
 * @param token - obtained from the auth endpoint, see fvAuth
 * @param json
 * @param method
 * @returns
 */
export const g$AuthRequest = (token: string, json: any, method = "POST") =>
  g$Request(json, method, { Authorization: `Bearer ${token}` });

export type FvAuthWithSigner = {
  fvSig: never;
  address: never;
  signer: Signer | providers.JsonRpcSigner;
};

export type FvAuthWithAddress = {
  address: string;
  fvSig: string;
  signer: never;
};

/**
 * Authenticates a user with the GoodDollar server
 * @param env production | staging | development
 * @param address - user address
 * @param fvSig - signature of the FV_IDENTIFIER_MSG2 message
 * @param signer - ethers signer when a user has not yet signed a message, does not need address or fvSig
 * @returns token and fvsig
 */
export const fvAuth = async (
  env: EnvKey,
  { address, fvSig, signer }: FvAuthWithAddress | FvAuthWithSigner
): Promise<any> => {
  const { backend } = Envs[env];
  const authEndpoint = `${backend}/auth/fv2`;

  const account = signer ? await signer.getAddress() : address;
  const fvsig = signer ? await signer.signMessage(FV_IDENTIFIER_MSG2.replace("<account>", account)) : fvSig;
  const { token } = await fetch(authEndpoint, g$Request({ fvsig, account })).then(g$Response);
  return { token, fvsig };
};

/**
 * Request a VerifiableLocationCredential issued by GoodDollar
 * @param baseEnv
 * @param [lat, long] as return from GeoLocation
 * @param fvSig - signature of the FV_IDENTIFIER_MSG2 message
 * @param account
 * @returns
 */
export const requestLocationCertificate = async (
  baseEnv: string,
  [lat, long]: [number, number],
  fvSig: string,
  account: string
): Promise<CertificateItem> => {
  const env = getDevEnv(baseEnv);
  const { backend } = Envs[env];
  const { token } = await fvAuth(env, { address: account, fvSig } as FvAuthWithAddress);

  return fetch(
    `${backend}/goodid/certificate/location`,
    g$AuthRequest(token, { user: {}, geoposition: { coords: { latitude: lat, longitude: long } } })
  ).then(g$Response) as Promise<any>;
};

/**
 * Request a VerifiableIdentityCredential issued by GoodDollar
 * this includes a VerifiableAgeCredential / VerifiableGenderCredential
 * @param baseEnv
 * @param fvSig - signature of the FV_IDENTIFIER_MSG2 message
 * @param account
 * @returns
 */
export const requestIdentityCertificate = async (
  baseEnv: string,
  fvSig: string,
  account: string
): Promise<CertificateItem> => {
  const env = getDevEnv(baseEnv);
  const { backend } = Envs[env];
  const { token } = await fvAuth(env, { address: account, fvSig } as FvAuthWithAddress);

  return fetch(`${backend}/goodid/certificate/identity`, g$AuthRequest(token, { enrollmentIdentifier: fvSig })).then(
    g$Response
  ) as Promise<any>;
};
