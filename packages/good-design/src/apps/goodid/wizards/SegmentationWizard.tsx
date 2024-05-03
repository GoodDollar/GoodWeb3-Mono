import React, { useContext, useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { Center, VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { noop } from "lodash";
import { GoodButton } from "../../../core";
import { DisputeThanks, OffersAgreement, SegmentationConfirmation, SegmentationScreen } from "../screens";
import { LoaderModal } from "../../../core/web3/modals";
import { WizardContext, WizardContextProvider } from "../../../utils/WizardContext";
import { WizardHeader } from "./WizardHeader";
import { GeoLocation, useGeoLocation } from "@gooddollar/web3sdk-v2";
import { SegmentationDispute } from "../screens/SegmentationDispute";

export type SegmentationProps = {
  onLocationRequest: (locationState: GeoLocation, account: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
  account?: string;
};

const SegmentationScreenWrapper = (props: SegmentationProps) => {
  const { goToStep } = useWizard();
  const { updateDataValue } = useContext(WizardContext);
  const [loading, setLoading] = useState(true);
  const [geoLocation, error] = useGeoLocation();
  const { account } = props;

  const proceed = async () => {
    void goToStep(3);
  };

  const handleDispute = () => {
    void goToStep(1);
  };

  useEffect(() => {
    // if neither error or location is set means a user has not given or denied the permission yet
    if ((error || geoLocation.location) && account) {
      updateDataValue("segmentation", "locationPermission", !error);
      void props.onLocationRequest(geoLocation, account).then(() => {
        setLoading(false);
      });
    }
  }, [geoLocation, account, error]);

  return !account || loading ? (
    <LoaderModal title={`We're checking \n your information`} overlay="dark" loading={true} onClose={noop} />
  ) : (
    <Center width={343}>
      <VStack paddingY={6} space={10}>
        <SegmentationScreen account={account} />
        <VStack space={3}>
          <GoodButton onPress={proceed}>yes, i am</GoodButton>
          <GoodButton onPress={handleDispute} variant="link-like" _text={{ underline: false }}>
            no, i am not
          </GoodButton>
        </VStack>
      </VStack>
    </Center>
  );
};

export const SegmentationWizard = (props: SegmentationProps) => {
  const [error, setError] = useState<string | null>(null);
  const { account = "" } = useEthers();
  // inject show modal on callbacks exceptions
  const modalOnDone: SegmentationProps["onDone"] = async error => {
    try {
      await props.onDone(error);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const modalOnLocation: SegmentationProps["onLocationRequest"] = async (...args) => {
    try {
      await props.onLocationRequest(...args);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const onDispute = async (disputedValues: string[]) => {
    // should report analytics
    // todo: replace with analytics report, log for 'unused var' eslint
    console.log("disputedValues", disputedValues);
  };

  return (
    <WizardContextProvider>
      <Wizard header={<WizardHeader onDone={modalOnDone} error={error} />}>
        <SegmentationScreenWrapper onDone={props.onDone} onLocationRequest={modalOnLocation} account={account} />
        {/* Optional paths, only shown to users who think there data is wrong */}
        <SegmentationDispute account={account} onDispute={onDispute} />
        <DisputeThanks />
        {/* optional path, only shown to users who has all their data verified */}
        <OffersAgreement />
        <SegmentationConfirmation />
      </Wizard>
    </WizardContextProvider>
  );
};
