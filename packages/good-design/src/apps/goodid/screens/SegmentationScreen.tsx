import React, { useContext } from "react";
import { Center, Spinner, Text, VStack } from "native-base";
import { noop } from "lodash";

import { BasicStyledModal } from "../../../core/web3/modals";
import { WizardContext } from "../../../utils/WizardContext";

import { SegmentationRow, typeLabelsSegmentation as typeLabels } from "../components";
import { TransTitle } from "../../../core/layout";
import { Image } from "../../../core/images";
import RoboBilly from "../../../assets/images/robo-billy.png";
import { SegmentationProps } from "../wizards";

const ModalLocationDenied = () => (
  <Text variant="sub-grey" textAlign="center">{`Your location will show as "Unverified" on \n your GoodID`}</Text>
);

export const SegmentationScreen = ({
  certificateSubjects
}: {
  certificateSubjects: SegmentationProps["certificateSubjects"];
}) => {
  const { data } = useContext(WizardContext);

  if (!certificateSubjects) {
    return <Spinner variant="page-loader" size="lg" />;
  }

  return (
    <Center>
      <BasicStyledModal
        title={/*i18n*/ "We could not \n confirm your \n location"}
        body={<ModalLocationDenied />}
        type={"cta"}
        show={data?.locationPermission === false}
        withOverlay={"dark"}
        onClose={noop}
        withCloseButton
      />
      <VStack space={10} width="100%" justifyContent="center" alignItems="center">
        <VStack space={6}>
          <TransTitle t={/*i18n*/ "Please confirm"} variant="title-gdblue" />
          <VStack variant="shadow-card" textAlign="center" paddingY="6" paddingX="0">
            {Object.entries(typeLabels).map(([key]) => (
              <SegmentationRow
                key={key}
                credentialSubject={certificateSubjects[key]}
                typeName={key as keyof typeof typeLabels}
              />
            ))}
          </VStack>
          <Center>
            <Image source={RoboBilly} w="75" h="120" style={{ resizeMode: "contain" }} />
          </Center>
        </VStack>
      </VStack>
    </Center>
  );
};
