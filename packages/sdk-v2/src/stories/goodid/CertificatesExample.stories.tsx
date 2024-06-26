import React, { useEffect, useCallback } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View, Text, Button } from "react-native";
import { useEthers } from "@usedapp/core";

import { Certificate, CredentialType } from "../../sdk/goodid/types";
import { W3Wrapper } from "../W3Wrapper";
import { GoodIdContextProvider } from "../../contexts/goodid/GoodIdContext";
import { useAggregatedCertificates, useCertificates } from "../../sdk";

const { Location, Identity, Age, Gender } = CredentialType;

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

const mockCertificate = (account: string, typesSet: "location" | "basicidentity") => {
  const mock: Certificate = {
    credentialSubject: {
      id: "" // example. Id will be set on server
    },
    issuer: {
      id: "did:key:p3Ls9vx5d7NDeqHwJG42bBxB2kzMEOgXB3tjVPQHqy1fjZrY"
    },
    type: ["VerifiableCredential"],
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    issuanceDate: new Date().toISOString(),
    proof: {
      type: "JwtProof2020",
      jwt: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE3MDgzMzI5OTQsImlzcyI6ImRpZDprZXk6ejZNa3Fuc1BzakRpZnFtaEZLMjlnVmdWN2hqU0FVZlNGN2d1VVFSVHRzM2ViV3Y0In0.ViJUzFSe3l3j7opIgDhgKKx-xtiXP3RpjWckyFsnYiCEm7WOv3WTZAVLkGVNXwAsevJZ6Pg9h1X_nSRytLNJAw"
    }
  };

  // the format would be: 'did:ethr:<wallet-address WITH 0x>
  mock.credentialSubject.id = `did:ethr:${account}`;

  switch (typesSet) {
    case "location":
      mock.type.push(Location);
      mock.credentialSubject.countryCode = "US";
      break;
    case "basicidentity":
      mock.type.push(Identity, Age, Gender);
      mock.credentialSubject.unique = true;
      mock.credentialSubject.gender = "Male";
      mock.credentialSubject.age = { from: 18, to: 20 };
  }

  return mock;
};

const CertificatesView = () => {
  const { account } = useEthers();
  const { storeCertificate, deleteCertificate } = useCertificates(account ?? "");
  const certificates = useAggregatedCertificates(account ?? "");

  const createMockCertificate = useCallback(
    async (typeset: Parameters<typeof mockCertificate>[1]) => {
      if (storeCertificate && account) {
        await storeCertificate(mockCertificate(account, typeset));
      }
    },
    [storeCertificate, account]
  );

  useEffect(() => {
    if (certificates?.length || !account) {
      return;
    }

    // add mocks on mount if nothing exists
    (["location", "basicidentity"] as Parameters<typeof mockCertificate>[1][]).forEach(createMockCertificate);
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [account, storeCertificate, certificates, createMockCertificate]);

  return (
    <View>
      <Button title="Issue location certificate" onPress={() => createMockCertificate("location")} />
      <Button title="Issue basic identity certificate" onPress={() => createMockCertificate("basicidentity")} />
      <Text>Which credentials do you have verified?</Text>

      {certificates?.map(({ id, typeName, key, certificate }) => {
        return (
          <View key={key}>
            <Text style={{ fontWeight: "bold" }}>{typeName}</Text>
            <Text>{JSON.stringify(certificate, null, 2)}</Text>
            <Button title="Delete" onPress={() => deleteCertificate([id])} />
          </View>
        );
      })}
    </View>
  );
};
const Page = (params: object) => {
  return (
    <W3Wrapper withMetaMask={true}>
      <GoodIdWrapper>
        <CertificatesView {...params} />
      </GoodIdWrapper>
    </W3Wrapper>
  );
};

export default {
  title: "GoodId/Example component for showing credentials from storage",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const CertificatesExample = Template.bind({});
