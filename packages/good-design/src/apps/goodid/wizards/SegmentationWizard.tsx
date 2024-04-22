import React, { useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { Center, VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { noop } from "lodash";
import { GoodButton } from "../../../core";
import { OffersAgreement, SegmentationConfirmation, SegmentationScreen } from "../screens";
import { LoaderModal } from "../../../core/web3/modals";
import { WizardContextProvider } from "../../../utils/WizardContext";
import { WizardHeader } from "./WizardHeader";
import { GeoLocation, useGeoLocation } from "@gooddollar/web3sdk-v2";

export type SegmentationProps = {
  onLocationRequest: (locationState: GeoLocation, account: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
};

const SegmentationScreenWrapper = (props: SegmentationProps) => {
  const { nextStep } = useWizard();
  const [loading, setLoading] = useState(true);
  const [geoLocation, error] = useGeoLocation();
  const { account } = useEthers();

  const proceed = async () => {
    void nextStep();
  };

  useEffect(() => {
    //todo: handle navigate back, should not run location request / fetching certificates again
    // if neither error or location is set means a user has not given or denied the permission yet
    if ((error || geoLocation.location) && account) {
      void props.onLocationRequest(geoLocation, account).then(() => {
        setLoading(false);
      });
    }
  }, [geoLocation, account]);

  return !account || loading ? (
    <LoaderModal title={`We're checking \n your information`} overlay="dark" loading={true} onClose={noop} />
  ) : (
    <Center width={343}>
      <VStack paddingY={6} space={10}>
        <SegmentationScreen account={account} />
        <VStack space={4}>
          <GoodButton onPress={proceed}>yes, i am</GoodButton>
          <GoodButton variant="link-like" _text={{ underline: false }}>
            no, i am not
          </GoodButton>
        </VStack>
      </VStack>
    </Center>
  );
};

export const SegmentationWizard = (props: SegmentationProps) => {
  const [error, setError] = useState<string | null>(null);
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

  return (
    <WizardContextProvider>
      <Wizard header={<WizardHeader onDone={modalOnDone} error={error} />}>
        <SegmentationScreenWrapper onDone={props.onDone} onLocationRequest={modalOnLocation} />
        <OffersAgreement />
        <SegmentationConfirmation />
      </Wizard>
    </WizardContextProvider>
  );
};
