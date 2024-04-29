import React, { useContext, useEffect, useMemo } from "react";
import { Center, Text, VStack } from "native-base";
import { CredentialSubject, CredentialType, useAggregatedCertificates } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";

import { BasicStyledModal } from "../../../core/web3/modals";
import { WizardContext } from "../../../utils/WizardContext";
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
  const verifiedValue = formatVerifiedValues({ credentialSubject, typeName: CredentialType[typeName] });
  const verifiedValueCopy = verifiedValue === "Unverified" ? `${verifiedValue}-${typeName}` : verifiedValue;

  return (
    <VStack>
      <Title variant="subtitle-grey">{typeLabels[typeName]}</Title>
      <Title variant="title-gdblue">{verifiedValueCopy}</Title>
    </VStack>
  );
};

const ModalLocationDenied = () => (
  <Text variant="sub-grey" textAlign="center">{`Your location will show as "Unverified" on \n your GoodID`}</Text>
);

export const SegmentationScreen = ({ account }: { account: string }) => {
  const { data, updateDataValue } = useContext(WizardContext);
  const certificates = useAggregatedCertificates(account);

  const certificateMap = useMemo(() => {
    return certificates.reduce((acc, { certificate, typeName }) => {
      if (certificate) {
        acc[typeName] = certificate.credentialSubject;
      }

      return acc;
    }, {} as Record<string, CredentialSubject | undefined>);
  }, [certificates]);

  useEffect(() => {
    certificates.forEach(({ certificate, typeName }) => {
      const certExists = !!certificate;
      updateDataValue("segmentation", typeName, certExists);
    });
  }, [certificates, updateDataValue]);

  return (
    <>
      <BasicStyledModal
        title={`We could not \n confirm your \n location`}
        body={<ModalLocationDenied />}
        type={"cta"}
        show={data?.locationPermission === false}
        withOverlay={"dark"}
        onClose={noop}
        withCloseButton
      />
      <VStack space={10}>
        <VStack space={6}>
          <Title variant="title-gdblue">Please confirm</Title>
          <VStack variant="shadow-card" textAlign="center">
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
