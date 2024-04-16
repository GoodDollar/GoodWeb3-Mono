import React from "react";
import { useRegisterRedtent, uploadToS3 } from "../../sdk";
import { W3Wrapper } from "../W3Wrapper";

const encoded = Buffer.from("hello text").toString("base64");
const Page = () => {
  const register = useRegisterRedtent();
  const upload = async () => {
    console.log({ encoded });
    const res = await uploadToS3(encoded, "test.txt");
    const registerRes = await register({ account: "", videoFilename: "", credentials: [] });
    console.log(res, registerRes);
  };
  return (
    <div>
      <button onClick={upload}>Upload</button>
    </div>
  );
};

export default {
  title: "Redtent upload to s3 example",
  component: Page,
  decorators: [
    Story => (
      <W3Wrapper withMetaMask={true}>
        <Story />
      </W3Wrapper>
    )
  ]
};

export const RedtentUploadExample = {
  args: {}
};
