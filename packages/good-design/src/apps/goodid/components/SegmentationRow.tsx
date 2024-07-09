import React from "react";
import { Checkbox, HStack, VStack } from "native-base";
import { CredentialSubject, CredentialType } from "@gooddollar/web3sdk-v2";

import { Title } from "../../../core/layout";
import { formatVerifiedValues } from "../../../utils/formatVerifiedValues";

export const typeLabelsDispute = {
  Gender: /*i18n*/ "I am",
  Age: /*i18n*/ "Aged",
  Location: /*i18n*/ "From"
};

export const typeLabelsSegmentation = {
  Gender: /*i18n*/ "Are you",
  Age: /*i18n*/ "Aged",
  Location: /*i18n*/ "In"
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
        <HStack space={4}>
          <Checkbox
            value={verifiedValue}
            onChange={isChecked => onCheck(isChecked)}
            colorScheme="info"
            accessibilityLabel={`Dispute ${verifiedValue}`}
          >
            <Title variant="title-gdblue" textAlign="center" minWidth="260">
              {verifiedValue}
            </Title>
          </Checkbox>
        </HStack>
      ) : (
        <Title variant="title-gdblue">{verifiedValue}</Title>
      )}
    </VStack>
  );
};

export default SegmentationRow;
