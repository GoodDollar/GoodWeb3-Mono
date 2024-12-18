import { Signer } from "ethers";
import { isEqual, omit } from "lodash";

import { FV_IDENTIFIER_MSG2, Envs } from "../constants";
import { EnvKey } from "../base";
import { CertificateItem, CertificateSubject, PoolCriteria } from "./types";

export const getDevEnv = (baseEnv: string) => (baseEnv === "fuse" ? "development" : baseEnv);

export interface ParsedBody {
  ok?: number;
  success?: boolean;
  error?: string;
  [key: string]: any;
}

type SafeParseResult = {
  body: ParsedBody;
  error?: Error;
};

const safeParse = (response: Response): Promise<SafeParseResult> =>
  response
    .json()
    .then(body => ({ body }))
    .catch(error => ({ error, body: {} }));

export const g$Response = async (response: Response) => {
  const { body, error } = await safeParse(response);
  // throw if
  // a) fetch response ok but failed to parse JSON (with parse error)
  // b) fetch response failed (status >= 400), with error from body (if have, unknown otherwise)
  // c) fetch response ok, but server returned ok: 0 or success: false, with error from body
  // (if have, unknown otherwise)
  if (!response.ok || error || ["ok", "success"].some(flag => flag in body && !body[flag])) {
    throw error ?? new Error(body.error ?? "Unknown GoodServer error");
  }
  return body;
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

/**
 * Authenticates a user with the GoodDollar server
 * @param env production | staging | development
 * @param address - user address
 * @param fvSig - signature of the FV_IDENTIFIER_MSG2 message. Made with a GoodDollar whitelisted wallet
 * @param signer - ethers signer when a user has not yet signed a message, does not need address or fvSig
 * @returns token and fvsig
 */
export async function fvAuth(env: EnvKey, address: string, fvSig: string): Promise<{ token: string; fvsig: string }>;
export async function fvAuth(env: EnvKey, signer: Signer): Promise<{ token: string; fvsig: string }>;
export async function fvAuth(
  env: EnvKey,
  account: Signer | string,
  fvSig?: string
): Promise<{ token: string; fvsig: string }> {
  const { backend } = Envs[env];
  const authEndpoint = `${backend}/auth/fv2`;
  const isSigner = "string" !== typeof account;
  const address = isSigner ? await account.getAddress() : account;
  const fvsig =
    !fvSig && isSigner ? await account.signMessage(FV_IDENTIFIER_MSG2.replace("<account>", address)) : fvSig;

  if (!fvsig) throw new Error("fvSig is required");

  const { token } = await fetch(authEndpoint, g$Request({ fvsig, account })).then(g$Response);

  return { token, fvsig };
}
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
  const { token } = await fvAuth(env, account, fvSig);

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
  const { token } = await fvAuth(env, account, fvSig);

  return fetch(`${backend}/goodid/certificate/identity`, g$AuthRequest(token, { enrollmentIdentifier: fvSig })).then(
    g$Response
  ) as Promise<any>;
};

type CriteriaMatcher = (certificateSubject: CertificateSubject, criteria: any) => boolean;

const matchLocation: CriteriaMatcher = (certificateSubject, criteria) =>
  isEqual(omit(certificateSubject, "id"), criteria);

const matchAge: CriteriaMatcher = (certificateSubject, criteria) =>
  !certificateSubject.age
    ? false
    : certificateSubject.age.min >= criteria.min && certificateSubject.age.max <= criteria.max;

const matchGender: CriteriaMatcher = (certificateSubject, criteria) => certificateSubject.gender === criteria;

/**
 * Criteria matchers for each criteria type
 * @param certificateSubject can be retrieved from a certificate by using the useCertificatesSubject hook
 * @param criteria
 * @param criteriaType
 * @returns boolean
 * @example
 *  checkCriteriaMatch(certificateSubject, { countryCode: "IL" }, "Location")
 */
export const criteriaMatchers: Record<string, CriteriaMatcher> = {
  Location: matchLocation,
  Age: matchAge,
  Gender: matchGender
};

export const checkCriteriaMatch = (
  certificateSubject: any,
  criteria: any,
  criteriaType: keyof PoolCriteria
): boolean => {
  const matcher = criteriaMatchers[criteriaType];
  return matcher ? matcher(certificateSubject, criteria) : false;
};
