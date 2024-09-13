import React, { FC, useEffect } from "react";
import { useCheckAvailableOffers } from "@gooddollar/web3sdk-v2";
import { Spinner } from "native-base";

import { RedtentController } from "../controllers/RedtentController";
import { isNull } from "lodash";

export interface CheckAvailableOffersProps {
  account: string;
  withNavBar: boolean;
  chainId: number;
  isDev?: boolean;
  onDone: (e?: Error | boolean | undefined) => Promise<void>;
  onSkip?: (skipOffer: boolean) => void;
  onError?: (e: Error | undefined) => void;
  // pools: any;
}

const redtentOffer = [
  {
    campaign: "RedTent",
    Location: {
      countryCode: "NG"
    },
    Gender: "Female"
  },
  {
    campaign: "RedTent",
    Location: {
      countryCode: "CO"
    },
    Gender: "Female"
  }
  // {
  //   campaign: "RedTent",
  //   Location: {
  //     countryCode: "PH" // not confirmed yet
  //   },
  //   Gender: "Female"
  // }
];

const CheckAvailableOffers: FC<CheckAvailableOffersProps> = ({
  account,
  isDev = false,
  withNavBar,
  onDone,
  onSkip,
  onError
}) => {
  const availableOffers = useCheckAvailableOffers({ account, pools: redtentOffer, isDev, onSkip });

  useEffect(() => {
    if (availableOffers === false || availableOffers?.length === 0) {
      if (onSkip) {
        onSkip(true);
        return;
      }

      void onDone?.();
    }
  }, [availableOffers]);

  // If isNull means we are still waiting for the availableOffers to be fetched
  // else we are just waiting on onDone to handle the next step / navigation
  if (isNull(availableOffers) || availableOffers === false || availableOffers?.length === 0)
    return <Spinner variant="page-loader" size="lg" />;

  return (
    /* todo-next: Currently hardcoded for redtent campaign, this should handle showing list of offers. needs design */
    <RedtentController
      {...{
        withNavBar,
        account,
        availableOffers,
        onDone,
        onError
      }}
    />
  );
};

export default CheckAvailableOffers;
