import { Envs } from "../../sdk/constants";

const getBearerToken = async (baseEnv: string, fvsig: string, account: string, type: "location" | "identity") => {
  const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
  const { backend } = Envs[devEnv];

  const endpoint = `${backend}/goodid/certificate/${type}}`;
  const authEndpoint = `${backend}/auth/fv2`;
  const { token } = await fetch(authEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fvsig, account })
  }).then(_ => _.json());

  return { token, endpoint };
};

export const requestLocationCertificate = async (
  baseEnv: string,
  [lat, long]: [number, number],
  fvSig: string,
  account: string
) => {
  const { endpoint, token } = await getBearerToken(baseEnv, fvSig, account, "location");

  return fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ user: {}, geoposition: { coords: { latitude: lat, longitude: long } } }),
    headers: { "content-type": "application/json", Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to get a location certificate");
      }
      return res.json();
    })
    .catch(e => {
      console.error("failed to get a location certificate:", e.message, e);
    });
};

export const requestIdentityCertificate = async (baseEnv: string, fvSig: string, account: string) => {
  const { endpoint, token } = await getBearerToken(baseEnv, fvSig, account, "identity");

  return fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ enrollmentIdentifier: fvSig }),
    headers: { "content-type": "application/json", Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to get a identity certificate");
      }
      return res.json();
    })
    .catch(e => {
      console.error("failed to get a identity certificate:", e.message, e);
    });
};
