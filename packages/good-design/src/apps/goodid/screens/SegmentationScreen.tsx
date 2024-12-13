import React, { useContext } from "react";
import { Center, Link, Spinner, Text, VStack } from "native-base";
import { noop } from "lodash";

import { BasicStyledModal } from "../../../core/web3/modals";
import { WizardContext } from "../../../utils/WizardContext";

import { SegmentationRow, typeLabelsSegmentation as typeLabels } from "../components";
import { TransTitle } from "../../../core/layout";
import { Image } from "../../../core/images";
import RoboBilly from "../../../assets/images/robo-billy.png";
import { SegmentationProps } from "../wizards";

const ModalLocationDenied = () => (
  <Text variant="sub-grey" textAlign="center">
    {`Your location will show as "Unverified" on \n your GoodID.`}{" "}
    <Link
      isExternal
      href="https://docs.gooddollar.org/wallet-and-products/goodid-and-goodoffers#why-does-my-location-show-as-unverified"
    >
      Need help?
    </Link>
  </Text>
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
        show={data?.segmentation?.locationPermission === false}
        withOverlay={"dark"}
        onClose={noop}
        withCloseButton
      />
      <VStack space={10} width="100%" justifyContent="center" alignItems="center">
        <VStack space={6} alignItems="center">
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
          <VStack space={4}>
            <Center>
              <Image source={RoboBilly} w="75" h="120" style={{ resizeMode: "contain" }} />
            </Center>
            <Text variant="browse-wrap">
              If your Location is showing as “Unverified,” you may need to check your device settings.{" "}
              <Link
                fontWeight="bold"
                isExternal
                href="https://docs.gooddollar.org/wallet-and-products/goodid-and-goodoffers#why-does-my-location-show-as-unverified"
              >
                Learn more.
              </Link>
            </Text>
          </VStack>
        </VStack>
      </VStack>
    </Center>
  );
};
