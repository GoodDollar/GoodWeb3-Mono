import React, { useContext, useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { Center, VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { noop } from "lodash";
import { GeoLocation, PoolCriteria, useGeoLocation } from "@gooddollar/web3sdk-v2";
import { Trans } from "@lingui/react";

import { TransButton } from "../../../core/layout";
import { DisputeThanks, OffersAgreement, SegmentationConfirmation, SegmentationScreen } from "../screens";
import { LoaderModal } from "../../../core/web3/modals";
import { WizardContext, WizardContextProvider } from "../../../utils/WizardContext";
import { WizardHeader } from "./WizardHeader";
import { SegmentationDispute } from "../screens/SegmentationDispute";
import { CheckAvailableOffers } from "../components";

export type SegmentationProps = {
  onLocationRequest: (locationState: GeoLocation, account: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
  onDataPermission: (accepted: string) => Promise<void>;
  withNavBar: boolean;
  certificateSubjects: any;
  account: string;
  isWhitelisted?: boolean;
  expiryFormatted: string | undefined;
  availableOffers: false | PoolCriteria[] | any;
  isDev?: boolean;
};

const SegmentationScreenWrapper = (
  props: Omit<SegmentationProps, "availableOffers" | "onDataPermission" | "expiryFormatted" | "withNavBar">
) => {
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

  return !account || loading || !props.certificateSubjects ? (
    <Trans
      id={"We're checking \n your information"}
      render={({ translation }: { translation: any }) => (
        <LoaderModal title={translation} overlay="dark" loading={true} onClose={noop} />
      )}
    />
  ) : (
    <Center width={"100%"}>
      <VStack paddingY={6} space={10}>
        <SegmentationScreen certificateSubjects={props.certificateSubjects} />
        <VStack space={3}>
          <TransButton t={/*i18n*/ "yes, i am"} onPress={proceed} />

          <TransButton
            t={/*i18n*/ "no, i am not"}
            onPress={handleDispute}
            _text={{ underline: false }}
            variant="link-like"
          />
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
      <Wizard header={<WizardHeader withNavBar={props.withNavBar} onDone={modalOnDone} error={error} />}>
        <SegmentationScreenWrapper
          onDone={modalOnDone}
          onLocationRequest={modalOnLocation}
          account={props.account}
          certificateSubjects={props.certificateSubjects}
        />
        {/* Optional paths, only shown to users who think there data is wrong */}
        <SegmentationDispute certificateSubjects={props.certificateSubjects} onDispute={onDispute} />
        <DisputeThanks />
        {/* Ask permission for matching their data against potential pools  */}
        <OffersAgreement onDataPermission={props.onDataPermission} />
        <SegmentationConfirmation
          {...{
            account,
            expiryFormatted: props.expiryFormatted,
            isWhitelisted: props.isWhitelisted,
            certificateSubjects: props.certificateSubjects
          }}
        />
        {/* if offers available it will handle the offers flow. 
        If no offers, or the flow is finished, handle next-step through onDone */}
        <CheckAvailableOffers
          withNavBar={props.withNavBar}
          account={account}
          availableOffers={props.availableOffers}
          onDone={modalOnDone}
        />
      </Wizard>
    </WizardContextProvider>
  );
};
