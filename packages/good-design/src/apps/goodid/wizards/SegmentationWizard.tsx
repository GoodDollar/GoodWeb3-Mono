import React, { useEffect, useState } from "react";
import { useWizard, Wizard } from "react-use-wizard";
import { Center, VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { noop } from "lodash";
import { GoodButton } from "../../../core";
import { OffersAgreement, SegmentationConfirmation, SegmentationScreen } from "../screens";
import { ErrorModal, LoaderModal } from "../../../core/web3/modals";
import { WizardContextProvider } from "../../../utils/WizardContext";
import { useLocation } from "@gooddollar/web3sdk-v2";

export type Props = {
  onLocationRequest: any;
  onDone: (error?: Error) => Promise<void>;
};

const SegmentationScreenWrapper = (props: Props) => {
  const { nextStep } = useWizard();
  const [loading, setLoading] = useState(true);
  const { locationState } = useLocation();
  const { account } = useEthers();
  const [error, setError] = useState<null | string>(null);

  const proceed = async () => {
    void nextStep();
  };

  useEffect(() => {
    // if neither error or location is set means a user has not given or denied the permission yet
    if ((locationState.error || locationState.location) && account) {
      props
        .onLocationRequest(locationState, account)
        .then(() => {
          setLoading(false);
        })
        .catch((e: any) => {
          setError(e.message);
          setLoading(false);
        });
    }
  }, [locationState, account]);

  if (!account || loading) {
    /* todo: fix loader modal */
    return <LoaderModal title={`We're checking \n your information`} overlay="dark" loading={true} onClose={noop} />;
  }

  if (error) {
    /* todo: add onClose logic */
    return <ErrorModal error={error} onClose={noop} overlay="dark" />;
  }

  return (
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

export const SegmentationWizard = (props: Props) => (
  <WizardContextProvider>
    <Wizard>
      <SegmentationScreenWrapper onDone={props.onDone} onLocationRequest={props.onLocationRequest} />
      <OffersAgreement />
      <SegmentationConfirmation />
    </Wizard>
  </WizardContextProvider>
);
