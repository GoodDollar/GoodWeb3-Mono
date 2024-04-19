import React, { useMemo } from "react";
import { Center, Text, VStack } from "native-base";
import { CredentialSubject, useAggregatedCertificates } from "@gooddollar/web3sdk-v2";

import { formatVerifiedValues } from "../../../utils/formatVerifiedValues";

import { Title } from "../../../core/layout";
import { Image } from "../../../core/images";
import RoboBilly from "../../../assets/images/robo-billy.png";

const typeLabels = {
  Gender: "Are you",
  Age: "Aged",
  Location: "In"
};

const SegmentationRow = ({
  credentialSubject,
  typeName
}: {
  credentialSubject: CredentialSubject | undefined;
  typeName: keyof typeof typeLabels;
}) => {
  const verifiedValue = formatVerifiedValues({ credentialSubject, typeName });
  return (
    <VStack>
      <Title variant="subtitle-grey">{typeLabels[typeName]}</Title>
      <Text fontFamily="body" fontSize="l" fontWeight="700" color="primary">
        {verifiedValue}
      </Text>
    </VStack>
  );
};

export const SegmentationScreen = ({ account }: { account: string }) => {
  const certificates = useAggregatedCertificates(account);

  const certificateMap = useMemo(() => {
    return certificates.reduce((acc, { certificate, typeName }) => {
      if (certificate) {
        acc[typeName] = certificate.credentialSubject;
      }
      return acc;
    }, {} as Record<string, CredentialSubject | undefined>);
  }, [certificates]);

  return (
    <>
      <VStack space={10}>
        <VStack space={6}>
          <Text fontFamily="heading" fontSize="l" fontWeight="700" color="primary" textAlign="center">
            Please confirm
          </Text>
          <VStack paddingY={6} space={4} width={343} borderRadius={15} bgColor="greyCard" shadow={1} textAlign="center">
            {Object.entries(typeLabels).map(([key]) => (
              <SegmentationRow
                key={key}
                credentialSubject={certificateMap[key]}
                typeName={key as keyof typeof typeLabels}
              />
            ))}
            <Center>
              <Image source={RoboBilly} w="75" h="120" style={{ resizeMode: "contain" }} />
            </Center>
          </VStack>
        </VStack>
      </VStack>
    </>
  );
};
