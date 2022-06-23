import { createLoginLink } from "../loginLinkUtils";
import { sampleObject, sampleLink } from "./data";

it("the method should return the correct valie", () => {
  const loginLink = createLoginLink(sampleObject);
  expect(loginLink).toBe(sampleLink);
});

it("the method should return the correct valie", () => {
  const loginLink = createLoginLink(sampleObject);
  expect(typeof loginLink).toBe("string");
});
