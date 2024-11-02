import React, { useMemo } from "react";
import { Checkbox, HStack, VStack } from "native-base";
import { CredentialSubject, CredentialType } from "@gooddollar/web3sdk-v2";

import { Title, TransTitle } from "../../../core/layout";
import { formatVerifiedValues } from "../../../utils/formatVerifiedValues";

export const typeLabelsDispute = {
  Gender: /*i18n*/ { id: "I am", comment: "context: I am (Male/Female)" },
  Age: /*i18n*/ { id: "Aged", comment: "context: Aged (X years of age)" },
  Location: /*i18n*/ { id: "From", comment: "context: From (Location)" }
};

export const typeLabelsSegmentation = {
  Gender: /*i18n*/ { id: "Are you", comment: "context: Are you (Male/Female)" },
  Age: /*i18n*/ { id: "Aged", comment: "context: Aged (X years of age)" },
  Location: /*i18n*/ { id: "In", comment: "context: In (Location)" }
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
  const verifiedValue = useMemo(
    () => formatVerifiedValues({ credentialSubject, typeName: CredentialType[typeName] }),
    [credentialSubject, typeName]
  );
  const typeLabels = onCheck ? typeLabelsDispute : typeLabelsSegmentation;

  return (
    <VStack space={onCheck ? 2 : undefined}>
      <TransTitle t={typeLabels[typeName].id} textAlign="center" variant="subtitle-grey" />
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
