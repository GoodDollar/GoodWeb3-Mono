import React from "react";
import { Checkbox, Center, HStack, VStack } from "native-base";
import { CredentialSubject, CredentialType } from "@gooddollar/web3sdk-v2";

import { Title } from "../../../core/layout";
import { formatVerifiedValues } from "../../../utils/formatVerifiedValues";

export const typeLabelsDispute = {
  Gender: "I am",
  Age: "Aged",
  Location: "From"
};

export const typeLabelsSegmentation = {
  Gender: "Are you",
  Age: "Aged",
  Location: "In"
};

const SegmentationRow = ({
  credentialSubject,
  typeName,
  onCheck
}: {
  credentialSubject: CredentialSubject | undefined;
  typeName: keyof typeof typeLabelsSegmentation | keyof typeof typeLabelsDispute;
  onCheck?: (checked: boolean) => void;
}) => {
  const verifiedValue = formatVerifiedValues({ credentialSubject, typeName: CredentialType[typeName] });
  const typeLabels = onCheck ? typeLabelsDispute : typeLabelsSegmentation;

  return (
    <VStack space={onCheck ? 2 : undefined}>
      <Title variant="subtitle-grey">{typeLabels[typeName]}</Title>
      {onCheck ? (
        <Center>
          <HStack space={4} width="100%" justifyContent={"flex-start"}>
            <Checkbox
              width="100%"
              value={verifiedValue}
              onChange={isChecked => onCheck(isChecked)}
              colorScheme="info"
              accessibilityLabel={`Dispute ${verifiedValue}`}
            >
              <Title variant="title-gdblue" textAlign="center" width="100%" minWidth={260}>
                {verifiedValue}
              </Title>
            </Checkbox>
          </HStack>
        </Center>
      ) : (
        <Title variant="title-gdblue">{verifiedValue}</Title>
      )}
    </VStack>
  );
};

export default SegmentationRow;