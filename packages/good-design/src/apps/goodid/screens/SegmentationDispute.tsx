import React, { useCallback, useContext } from "react";
import { Center, VStack } from "native-base";
import { useAggregatedCertificates } from "@gooddollar/web3sdk-v2";
import { useWizard } from "react-use-wizard";
import { useCertificatesSubject } from "@gooddollar/web3sdk-v2";

import { Title } from "../../../core/layout";
import { GoodButton } from "../../../core/buttons";
import { Image } from "../../../core/images";
import { WizardContext } from "../../../utils/WizardContext";
import { SegmentationRow, typeLabelsDispute as typeLabels } from "../components";

import RoboBilly from "../../../assets/images/robo-billy.png";

export const SegmentationDispute = ({
  account,
  onDispute
}: {
  account: string;
  onDispute: (disputedValues: string[]) => Promise<void>;
}) => {
  const { nextStep } = useWizard();
  const { data, updateDataValue } = useContext(WizardContext);
  const certificates = useAggregatedCertificates(account);

  const certificatesSubjects = useCertificatesSubject(certificates);

  const handleCheckChange = (typeName: string, checked: boolean) => {
    updateDataValue("segmentationDispute", typeName, checked);
  };

  const handleNext = useCallback(async () => {
    const disputedValues = Object.entries(data.segmentationDispute)
      .map(([key, isDisputed]) => (isDisputed ? key : ""))
      .filter(Boolean) as string[];

    await onDispute(disputedValues);
    void nextStep();
  }, [data]);

  return (
    <VStack space={10} width={343}>
      <Title variant="title-gdblue">Please indicate which is incorrect</Title>
      <VStack space={6} variant="shadow-card" textAlign="center">
        {Object.entries(typeLabels).map(([key]) => (
          <SegmentationRow
            key={key}
            credentialSubject={certificatesSubjects[key]}
            typeName={key as keyof typeof typeLabels}
            onCheck={checked => handleCheckChange(key, checked)}
          />
        ))}
        <Center>
          <Image source={RoboBilly} w="75" h="120" style={{ resizeMode: "contain" }} />
        </Center>
      </VStack>
      <VStack space={3}>
        <GoodButton onPress={handleNext}>Next</GoodButton>
      </VStack>
    </VStack>
  );
};
