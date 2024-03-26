import { Envs } from "../../sdk/constants";

//todo: add bearer token, see fv-delete flow for example
export const requestLocationCertificate = async (baseEnv: string, [lat, long]: [number, number]) => {
  const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
  const { backend } = Envs[devEnv];

  return fetch(backend + "/goodid/certificate/location", {
    method: "POST",
    body: JSON.stringify({ user: {}, geoposition: { coords: { latitude: lat, longitude: long } } }),
    headers: { "content-type": "application/json" }
  })?.catch(e => {
    console.error("We failed to get a location certificate:", e.message, e);
  });
};
