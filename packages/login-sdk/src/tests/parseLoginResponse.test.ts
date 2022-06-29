import { parseLoginResponse } from "../parseLoginResponse";
import { sampleGooddollarSignedObject, parsedResult, sampleWhitelistedGooddollarSignedObject } from "./data";

it("parseLoginResponse method should return verified for whitelisted address", async () => {
  const parseLoginObject = await parseLoginResponse(sampleWhitelistedGooddollarSignedObject, "fuse");
  console.log({ parseLoginObject });
  expect(parseLoginObject).toMatchObject({
    isAddressWhitelisted: { value: true, isVerified: true },
    verifiedResponse: true
  });
});

it("parseLoginResponse method should return the correct value", async () => {
  const parseLoginObject = await parseLoginResponse(sampleGooddollarSignedObject, "fuse");
  expect(parseLoginObject).toStrictEqual({
    ...parsedResult,
    verifiedResponse: true
  });
});

it("parseLoginResponse method should return the verfiedReponse false when given the incorrect value", async () => {
  const parseLoginObject = await parseLoginResponse(
    {
      ...sampleGooddollarSignedObject,
      a: { value: "0x9E6Ea049A281F513a2BAbb106AF1E023FEEeCfA", attestation: "" }
    },
    "fuse"
  );
  expect(parseLoginObject).toStrictEqual({
    ...parsedResult,
    isAddressWhitelisted: { value: true, isVerified: false },
    walletAddress: {
      value: "0x9E6Ea049A281F513a2BAbb106AF1E023FEEeCfA",
      isVerified: false
    },
    verifiedResponse: false,
    error: "address mismatch"
  });
}, 10000);
