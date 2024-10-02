import React, { useCallback, useContext, useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { Center, VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { noop } from "lodash";
import { AsyncStorage, GeoLocation, useGeoLocation } from "@gooddollar/web3sdk-v2";
import { Trans } from "@lingui/react";

import { TransButton } from "../../../core/layout";
import { DisputeThanks, OffersAgreement, SegmentationConfirmation, SegmentationScreen } from "../screens";
import { LoaderModal } from "../../../core/web3/modals";
import { WizardContext, WizardContextProvider } from "../../../utils/WizardContext";
import { WizardHeader } from "./WizardHeader";
import { SegmentationDispute } from "../screens/SegmentationDispute";

export type SegmentationProps = {
  onLocationRequest: (locationState: GeoLocation, account: string) => Promise<void>;
  onDone: (error?: Error | boolean) => Promise<void>;
  onDataPermission: (accepted: string) => Promise<void>;
  withNavBar: boolean;
  certificateSubjects: any;
  account: string;
  isWhitelisted?: boolean;
  expiryFormatted: string | undefined;
  isDev?: boolean;
  isWallet?: boolean;
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
    if ((error || geoLocation?.location) && account) {
      updateDataValue("segmentation", "locationPermission", !error);
      void props.onLocationRequest(geoLocation, account).then(() => {
        setLoading(false);
      });
    }
  }, [geoLocation, account, error]);

  return !account || loading || !props.certificateSubjects ? (
    <Center height="100%">
      <Trans
        id={"We're checking \n your information"}
        render={({ translation }: { translation: any }) => (
          <LoaderModal title={translation} overlay="dark" loading={true} onClose={noop} />
        )}
      />
    </Center>
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
  const [stepHistory, setStepHistory] = useState<number[]>([0]);

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
    await AsyncStorage.setItem("goodid_disputedSubjects", JSON.stringify(disputedValues));
  };

  const onStepChange = useCallback(
    (step: number) => {
      setStepHistory(prev => [...prev, step]);
    },
    [stepHistory]
  );

  return (
    <WizardContextProvider>
      <Wizard
        header={
          <WizardHeader withNavBar={props.withNavBar} onDone={modalOnDone} error={error} stepHistory={stepHistory} />
        }
        onStepChange={onStepChange}
      >
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
            onDone: modalOnDone,
            expiryFormatted: props.expiryFormatted,
            isWhitelisted: props.isWhitelisted,
            certificateSubjects: props.certificateSubjects,
            isWallet: props.isWallet ?? false
          }}
        />
      </Wizard>
    </WizardContextProvider>
  );
};
