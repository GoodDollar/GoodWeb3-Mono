import React, { useCallback, useState } from "react";
import { Center, IStackProps, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { TransButton, TransTitle } from "../../../core/layout";
import { Image } from "../../../core/images";
import { SegmentationRow, typeLabelsDispute as typeLabels } from "../components";
import { SegmentationProps } from "../wizards";
import { withTheme } from "../../../theme/hoc/withTheme";

import RoboBilly from "../../../assets/images/robo-billy.png";

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

    return (
      <VStack space={10} width={"100%"} alignItems="center" {...props}>
        <TransTitle t={/*i18n*/ "Please indicate which is incorrect"} variant="title-gdblue" />
        <VStack space={6} variant="shadow-card" textAlign="center">
          {Object.entries(typeLabels).map(([key]) => (
            <SegmentationRow
              key={key}
              credentialSubject={certificateSubjects ? certificateSubjects[key] : undefined}
              typeName={key as keyof typeof typeLabels}
              onCheck={checked => handleCheckChange(key, checked)}
            />
          ))}
          <Center>
            <Image source={RoboBilly} w="75" h="120" style={{ resizeMode: "contain" }} />
          </Center>
        </VStack>
        <VStack space={3} {...buttonContainer}>
          <TransButton t={/*i18n*/ "Next"} onPress={handleNext} />
        </VStack>
      </VStack>
    );
  }
);
