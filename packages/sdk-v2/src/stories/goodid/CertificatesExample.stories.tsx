import React, { useContext, useEffect, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View, Text } from "react-native";
import { useEthers } from "@usedapp/core";

import type { Certificate } from "../../sdk/goodid/types";
import { W3Wrapper } from "../W3Wrapper";
import { GoodIdContext, GoodIdContextProvider } from "../../contexts/goodid/GoodIdContext";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

enum CredentialTypes {
  VerifiableLocationCredential = "Location",
  VerifiableAgeCredential = "Age",
  VerifiableGenderCredential = "Gender",
  VerifiableIdentityCredential = "Identity"
}

const mockCertificate = {
  credentialSubject: {
    id: "", // example. Id will be set on server
    countryCode: "US"
  },
  issuer: {
    id: "did:key:p3Ls9vx5d7NDeqHwJG42bBxB2kzMEOgXB3tjVPQHqy1fjZrY"
  },
  type: ["VerifiableCredential", "VerifiableLocationCredential"],
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  issuanceDate: "2024-02-19T08:56:34.000Z",
  proof: {
    type: "JwtProof2020",
    jwt: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE3MDgzMzI5OTQsImlzcyI6ImRpZDprZXk6ejZNa3Fuc1BzakRpZnFtaEZLMjlnVmdWN2hqU0FVZlNGN2d1VVFSVHRzM2ViV3Y0In0.ViJUzFSe3l3j7opIgDhgKKx-xtiXP3RpjWckyFsnYiCEm7WOv3WTZAVLkGVNXwAsevJZ6Pg9h1X_nSRytLNJAw"
  }
};

const CertificatesView = () => {
  const { account } = useEthers();
  const [certificates, setCertificates] = useState<Certificate[] | undefined>([]);
  const { storeCertificate, getCertificates } = useContext(GoodIdContext);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (getCertificates) {
        try {
          const certificates = await getCertificates();

          // example: considering a case where people might have a shared-device and have multiple credentials in the same storage
          const filteredCertificates = certificates?.filter(
            certificate =>
              certificate.credentialSubject.id === account && Object.keys(CredentialTypes).includes(certificate.type[1])
          );

          setCertificates(filteredCertificates ?? []);
        } catch (e) {
          console.error("Error fetching credentials", e);
        }
      }
    };

    const createMockCertificate = async () => {
      if (storeCertificate && account) {
        //example: only for story is this done. in practice its passed down to server for issueCertificate
        // the format would be: 'did:ethr:<wallet-address>
        mockCertificate.credentialSubject.id = account;
        await storeCertificate(mockCertificate).then(() => fetchCertificates());
      }
    };

    void createMockCertificate();
  }, [account]);

  return (
    <View>
      <Text>Which credentials do you have verified?</Text>
      {certificates?.map((certificate, index) => {
        return (
          <View key={index}>
            <Text style={{ fontWeight: "bold" }}>{CredentialTypes[certificate.type[0]]}</Text>
            <Text>{certificate.credentialSubject.countryCode}</Text>
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
  title: "Example component for showing credentials from storage",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const CertificatesExample = Template.bind({});
