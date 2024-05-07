import React, { useContext, useEffect } from "react";
import { Center, Text, VStack } from "native-base";
import { useAggregatedCertificates } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useCertificatesSubject } from "@gooddollar/web3sdk-v2";

import { BasicStyledModal } from "../../../core/web3/modals";
import { WizardContext } from "../../../utils/WizardContext";

import { SegmentationRow, typeLabelsSegmentation as typeLabels } from "../components";
import { Title } from "../../../core/layout";
import { Image } from "../../../core/images";
import RoboBilly from "../../../assets/images/robo-billy.png";

const ModalLocationDenied = () => (
  <Text variant="sub-grey" textAlign="center">{`Your location will show as "Unverified" on \n your GoodID`}</Text>
);

export const SegmentationScreen = ({ account }: { account: string }) => {
  const { data, updateDataValue } = useContext(WizardContext);
  const certificates = useAggregatedCertificates(account);

  const certificatesSubjects = useCertificatesSubject(certificates);

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
                credentialSubject={certificatesSubjects[key]}
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
