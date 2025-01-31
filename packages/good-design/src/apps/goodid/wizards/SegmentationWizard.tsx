import React, { useCallback, useContext, useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { Center, VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { noop } from "lodash";
import { AsyncStorage, GeoLocation, useGeoLocation, useSendAnalytics } from "@gooddollar/web3sdk-v2";
import { Trans } from "@lingui/react";

import { TransButton } from "../../../core/layout";
import { DisputeThanks, OffersAgreement, SegmentationConfirmation, SegmentationScreen } from "../screens";
import { LoaderModal, TxModal } from "../../../core/web3/modals";
import { WizardContext, WizardContextProvider } from "../../../utils/WizardContext";
import { WizardHeader } from "./WizardHeader";
import { SegmentationDispute } from "../screens/SegmentationDispute";

const SegmentationLoaderModal = ({ isWallet }: { isWallet: boolean | undefined }) => {
  return isWallet ? (
    <Trans
      id={"We're checking \n your information"}
      render={({ translation }: { translation: any }) => (
        <LoaderModal title={translation} overlay="dark" loading={true} onClose={noop} />
      )}
    />
  ) : (
    <TxModal
      customTitle={{ title: { id: "Please sign with your wallet to continue your GoodID upgrade", values: {} } }}
      type="goodid"
      isPending={true}
    />
  );
};

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
  const { track } = useSendAnalytics();
  const { account } = props;

  const proceed = async () => {
    track("goodid_confirm");
    void goToStep(3);
  };

  const handleDecline = () => {
    track("goodid_dispute_start");
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
    <SegmentationLoaderModal {...{ isWallet: props.isWallet }} />
  ) : (
    <Center width={"100%"}>
      <VStack paddingY={6} space={10}>
        <SegmentationScreen certificateSubjects={props.certificateSubjects} />
        <VStack space={3}>
          <TransButton t={/*i18n*/ "yes, i am"} onPress={proceed} />

          <TransButton
            t={/*i18n*/ "no, i am not"}
            onPress={handleDecline}
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
  const { track } = useSendAnalytics();

  // inject show modal on callbacks exceptions
  const modalOnDone: SegmentationProps["onDone"] = async error => {
    try {
      await props.onDone(error);
    } catch (e: any) {
      track("goodid_error", { error: "segmentation onDone failed", message: e?.message, e });
      setError(e.message);
    }
  };

  const modalOnLocation: SegmentationProps["onLocationRequest"] = async (...args) => {
    try {
      // after location request is done, we trigger the request of certificates
      await props.onLocationRequest(...args);
    } catch (e: any) {
      track("goodid_error", { error: "onLocationRequest failed", message: e?.message, e });
      setError(e.message);
    }
  };

  const onDispute = async (disputedValues: string[]) => {
    await AsyncStorage.setItem("goodid_disputedSubjects", JSON.stringify(disputedValues));
    track("goodid_dispute_confirm", { disputedValues });
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
          isWallet={props.isWallet}
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
