import { isString } from "lodash";

export const encodeBase64Params = (value: any) =>
  encodeURIComponent(btoa(isString(value) ? value : JSON.stringify(value)));

export type DataToRequest = "mobile" | "email" | "location" | "name" | "avatar";

interface Props {
  /*gooddollar wallet link to redirect to*/
  redirectLink?: string;
  /* v: name of vendor */
  v: string;
  /* web: vendor url */
  web: string;
  /* id: vendor whitelisted G$ address */
  id: string;
  /* cbu: callback url */
  cbu?: string;
  /* rdu: redirect url */
  rdu?: string;
  /* r: an array with extra user information fields requested (ie mobile,location,email,avatar,name) */
  r: Array<DataToRequest>;
}

export const createLoginLink = ({ v, web, id, cbu, rdu, r, redirectLink }: Props) => {
  const websiteLink = redirectLink ?? "http://wallet.gooddollar.org/AppNavigation/LoginRedirect";
  const objectToEncode = { v, web, id, cbu, rdu, r };

  if (!cbu && !rdu) {
    throw new Error("Please provide either a cbu or rdu");
  }

  return `${websiteLink}?login=${encodeBase64Params(objectToEncode)}`;
};
