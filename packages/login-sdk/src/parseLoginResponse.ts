import Web3 from "web3";
import ContractsAddress from "@gooddollar/goodprotocol/releases/deployment.json";
import IdentityABI from "@gooddollar/goodprotocol/artifacts/contracts/Interfaces.sol/IIdentity.json";
import { env } from "process";

export type LoginResponse = {
  //Wallet address
  a: { value: string; attestation: string };
  //Is address whitelisted
  v: { value: boolean; attestation: string };
  //Location i.e Country
  I?: { value: string; attestation: string };
  // Full Name
  n?: { value: string; attestation: string };
  //Email
  e?: { value: string; attestation: string };
  //Mobile
  m?: { value: string; attestation: string };
  //Avatar
  av?: { value: string; attestation: string };
  //Timestamp of response
  nonce: { value: number; attestation: string };
  //Signed object
  sig: any;
  //Error
  error?: string;
};

export type ParsedValue = {
  value: string | number | boolean;
  isVerified: boolean;
};
export type ParsedResponse = {
  verifiedResponse?: boolean;
  walletAddress: ParsedValue;
  isAddressWhitelisted: ParsedValue;
  location?: ParsedValue;
  avatar?: ParsedValue;
  fullName?: ParsedValue;
  mobile?: ParsedValue;
  email?: ParsedValue;
};

const transformObject = (res: LoginResponse): ParsedResponse => ({
  walletAddress: { value: res.a.value, isVerified: false },
  isAddressWhitelisted: { value: res.v.value, isVerified: false },
  ...(res?.I?.value ? { location: { value: res.I.value, isVerified: false } } : {}),
  ...(res?.av?.value ? { avatar: { value: res.av.value, isVerified: false } } : {}),
  ...(res?.n?.value ? { fullName: { value: res.n.value, isVerified: false } } : {}),
  ...(res?.m?.value ? { mobile: { value: res.m.value, isVerified: false } } : {}),
  ...(res?.e?.value ? { email: { value: res.e.value, isVerified: false } } : {})
});

export const parseLoginResponse = async (response: LoginResponse): Promise<ParsedResponse | void> => {
  if (response?.error) {
    return;
  }
  const { sig, a, nonce, v } = response;
  const nonceNotToOld = Date.now() - nonce.value <= 600000;
  if (nonceNotToOld) {
    const web3Instance = new Web3(new Web3.providers.HttpProvider("https://rpc.fuse.io/"));
    const dataToRecover = { ...response };
    delete dataToRecover.sig;
    const userRecoveredWalletAddress = web3Instance.eth.accounts.recover(JSON.stringify(dataToRecover), sig);
    if (userRecoveredWalletAddress === a.value) {
      const identityContract = new web3Instance.eth.Contract(
        IdentityABI.abi as any,
        (ContractsAddress as any)[env?.REACT_APP_NETWORK ?? "fuse"].Identity,
        { from: a.value }
      );
      try {
        const isAddressWhitelisted = v.value && (await identityContract.methods.isWhitelisted(a.value).call());
        return {
          ...transformObject(response),
          isAddressWhitelisted: { value: isAddressWhitelisted, isVerified: true },
          verifiedResponse: true
        };
      } catch (e) {
        console.error(e);
        return { ...transformObject(response), verifiedResponse: false };
      }
    } else {
      console.warn("address mismatch", { userRecoveredWalletAddress, address: a.value });
      return { ...transformObject(response), verifiedResponse: false };
    }
  } else {
    console.warn("nonce too old");
    return { ...transformObject(response), verifiedResponse: false };
  }
};
