import React, { useContext, useEffect, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
// import { useVeramo, VeramoProvider } from "@veramo-community/veramo-react";
import { View, Text } from "react-native";
import { useEthers } from "@usedapp/core";

import type { VerifiableCredential } from "../../sdk/goodid/types";
import { W3Wrapper } from "../W3Wrapper";
import { GoodIdContext, GoodIdContextProvider } from "../../contexts/goodid/GoodIdContext";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

enum CredentialTypes {
  VerifiableLocationCredential = "Location",
  VerifiableAgeCredential = "Age",
  VerifiableGenderCredential = "Gender"
}

const mockCredential = {
  credentialSubject: {
    id: "",
    countryCode: "US"
  },
  issuer: {
    id: "did:key:p3Ls9vx5d7NDeqHwJG42bBxB2kzMEOgXB3tjVPQHqy1fjZrY"
  },
  type: ["VerifiableLocationCredential"],
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  issuanceDate: "2024-02-19T08:56:34.000Z",
  proof: {
    type: "JwtProof2020",
    jwt: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE3MDgzMzI5OTQsImlzcyI6ImRpZDprZXk6ejZNa3Fuc1BzakRpZnFtaEZLMjlnVmdWN2hqU0FVZlNGN2d1VVFSVHRzM2ViV3Y0In0.ViJUzFSe3l3j7opIgDhgKKx-xtiXP3RpjWckyFsnYiCEm7WOv3WTZAVLkGVNXwAsevJZ6Pg9h1X_nSRytLNJAw"
  }
};

const CredentialsView = () => {
  const { account } = useEthers();
  const [credentials, setCredentials] = useState<VerifiableCredential[] | undefined>([]);
  const { createCredential, getActiveCredentials } = useContext(GoodIdContext);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (getActiveCredentials) {
        const credentials = await getActiveCredentials();
        const filteredCredentials = credentials?.filter(
          credential =>
            credential.credentialSubject.id === account && Object.keys(CredentialTypes).includes(credential.type[0])
        );
        console.log("filteredCredentials", filteredCredentials);
        setCredentials(filteredCredentials ?? []);
      }
    };

    // note: does not yet consider already existing credential
    const createMockCredential = async () => {
      if (createCredential && account) {
        mockCredential.credentialSubject.id = account;
        await createCredential(mockCredential).then(() => fetchCredentials());
      }
    };

    void createMockCredential();
  }, [account]);

  return (
    <View>
      <Text>Which credentials do you have verified?</Text>
      {credentials?.map((credential, index) => {
        return (
          <View key={index}>
            <Text style={{ fontWeight: "bold" }}>{CredentialTypes[credential.type[0]]}</Text>
            <Text>{credential.credentialSubject.countryCode}</Text>
          </View>
        );
      })}
    </View>
  );
};
const Page = (params: object) => {
  return (
    <W3Wrapper withMetaMask={true}>
      {/* @ts-ignore */}
      {/* <VeramoProvider agents={[agent]}> */}
      <GoodIdWrapper>
        <CredentialsView {...params} />
      </GoodIdWrapper>
      {/* </VeramoProvider> */}
    </W3Wrapper>
  );
};

export default {
  title: "Example component for showing credentials from storage",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const CredentialsExample = Template.bind({});
