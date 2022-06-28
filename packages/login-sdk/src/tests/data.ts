export const sampleObject: any = {
  v: "Google",
  web: "https://www.google.com",
  id: "0x09D2011Ca5781CA70810F6d82837648132762F9a",
  r: ["mobile", "location", "email", "name"],
  rdu: "http://localhost:3001/"
};

export const sampleLink =
  "http://wallet.gooddollar.org/AppNavigation/LoginRedirect?login=eyJ2IjoiR29vZ2xlIiwid2ViIjoiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbSIsImlkIjoiMHgwOUQyMDExQ2E1NzgxQ0E3MDgxMEY2ZDgyODM3NjQ4MTMyNzYyRjlhIiwicmR1IjoiaHR0cDovL2xvY2FsaG9zdDozMDAxLyIsInIiOlsibW9iaWxlIiwibG9jYXRpb24iLCJlbWFpbCIsIm5hbWUiXX0%3D";

export const sampleBase64EncodedString =
  "eyJ2IjoiR29vZ2xlIiwid2ViIjoiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbSIsImlkIjoiMHgwOUQyMDExQ2E1NzgxQ0E3MDgxMEY2ZDgyODM3NjQ4MTMyNzYyRjlhIiwicmR1IjoiaHR0cDovL2xvY2FsaG9zdDozMDAxLyIsInIiOlsibW9iaWxlIiwibG9jYXRpb24iLCJlbWFpbCIsIm5hbWUiXX0%3D";

export const sampleGooddollarSignedObject = {
  a: { value: "0x9E6Ea049A281F513a2BAbb106AF1E023FEEeCfA9", attestation: "" },
  v: { value: true, attestation: "" },
  I: { value: "India", attestation: "" },
  n: { value: "Harjaap Dhillon", attestation: "" },
  e: { value: "harvydhillon16@gmail.com", attestation: "" },
  m: { value: "+918146851290", attestation: "" },
  nonce: { value: Date.now(), attestation: "" },
  sig: "0xadbf6657ff309f9f25dddf72d2d04ec3b0af053b2db9121910f79ea82bce486e1db26ea639670fa1600ce862e209845e1d2a73ad7a4a4e858a80dfa33f79e0ef1c"
};

export const parsedResult = {
  walletAddress: {
    value: "0x9E6Ea049A281F513a2BAbb106AF1E023FEEeCfA9",
    isVerified: false
  },
  isAddressWhitelisted: { value: true, isVerified: false },
  location: { value: "India", isVerified: false },
  fullName: { value: "Harjaap Dhillon", isVerified: false },
  email: { value: "harvydhillon16@gmail.com", isVerified: false },
  mobile: { value: "+918146851290", isVerified: false },
  nonce: { value: Date.now(), isVerified: false }
};
