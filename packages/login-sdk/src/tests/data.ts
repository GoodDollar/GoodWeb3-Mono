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
  a: { value: "0x76C89a6F67882a228fA999eB8F15080D86B2E8B5", attestation: "" },
  v: { value: true, attestation: "" },
  I: { value: "India", attestation: "" },
  n: { value: "Harjaap Dhillon", attestation: "" },
  e: { value: "harvydhillon16@gmail.com", attestation: "" },
  m: { value: "+918146851290", attestation: "" },
  nonce: { value: 3312972836304, attestation: "" },
  sig: "0x842bcfa173f420074870f88111d629399ef3f4455b203ce728c3c9007eb89902362e707f2bc8d124d58a8272d6e1f662eebe6d9dc3e2f75c9717036f0023cef21c"
};

export const parsedResult = {
  walletAddress: {
    value: "0x76C89a6F67882a228fA999eB8F15080D86B2E8B5",
    isVerified: false
  },
  isAddressWhitelisted: { value: false, isVerified: true },
  location: { value: "India", isVerified: false },
  fullName: { value: "Harjaap Dhillon", isVerified: false },
  email: { value: "harvydhillon16@gmail.com", isVerified: false },
  mobile: { value: "+918146851290", isVerified: false }
};
