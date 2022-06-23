import { parseLoginLink } from "../loginLinkUtils";
import { sampleBase64EncodedString, sampleObject } from "./data";

it("parseLoginLink method should return the correct value", () => {
  const parseLoginObject = parseLoginLink(sampleBase64EncodedString);
  expect(parseLoginObject).toStrictEqual(sampleObject);
});