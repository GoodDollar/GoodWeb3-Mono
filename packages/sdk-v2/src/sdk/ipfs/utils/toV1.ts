import { CID } from "multiformats/cid";
// eslint-disable-next-line
export const toV1 = cid => CID.parse(cid).toV1().toString();
