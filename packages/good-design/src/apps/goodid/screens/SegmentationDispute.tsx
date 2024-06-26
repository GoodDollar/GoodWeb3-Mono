import React, { useCallback, useState } from "react";
import { Center, IStackProps, Spinner, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { Title } from "../../../core/layout";
import { GoodButton } from "../../../core/buttons";
import { Image } from "../../../core/images";
import { SegmentationRow, typeLabelsDispute as typeLabels } from "../components";
import { SegmentationProps } from "../wizards";
import { withTheme } from "../../../theme/hoc";

import RoboBilly from "../../../assets/images/robo-billy.png";
import { isEmpty } from "lodash";

export const SegmentationDispute = withTheme({ name: "SegmentationDispute" })(
  ({
    certificateSubjects,
    onDispute,
    styles,
    ...props
  }: IStackProps & {
    certificateSubjects: SegmentationProps["certificateSubjects"];
    onDispute: (disputedValues: string[]) => Promise<void>;
    styles?: any;
  }) => {
    const { nextStep } = useWizard();
    const [disputed, setDisputed] = useState<string[]>([]);
    const { buttonContainer } = styles ?? {};

    const handleCheckChange = (typeName: string, checked: boolean) => {
      setDisputed(prev => (checked ? [...prev, typeName] : prev.filter(item => item !== typeName)));
    };

    const handleNext = useCallback(async () => {
      await onDispute(disputed);
      void nextStep();
    }, [disputed]);

    if (isEmpty(certificateSubjects)) {
      return <Spinner variant="page-loader" size="lg" />;
    }

    return (
      <VStack space={10} width={"100%"} alignItems="center" {...props}>
        <Title variant="title-gdblue">Please indicate which is incorrect</Title>
        <VStack space={6} variant="shadow-card" textAlign="center">
          {certificateSubjects &&
            Object.entries(typeLabels).map(([key]) => (
              <SegmentationRow
                key={key}
                credentialSubject={certificateSubjects[key]}
                typeName={key as keyof typeof typeLabels}
                onCheck={checked => handleCheckChange(key, checked)}
              />
            ))}
          <Center>
            <Image source={RoboBilly} w="75" h="120" style={{ resizeMode: "contain" }} />
          </Center>
        </VStack>
        <VStack space={3} {...buttonContainer}>
          <GoodButton onPress={handleNext}>Next</GoodButton>
        </VStack>
      </VStack>
    );
  }
);
