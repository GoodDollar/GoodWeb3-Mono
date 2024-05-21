import React, { useContext } from "react";
import { Center, Spinner, Text, VStack } from "native-base";
import { noop } from "lodash";

import { BasicStyledModal } from "../../../core/web3/modals";
import { WizardContext } from "../../../utils/WizardContext";

import { SegmentationRow, typeLabelsSegmentation as typeLabels } from "../components";
import { Title } from "../../../core/layout";
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
                credentialSubject={certificateSubjects[key]}
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
