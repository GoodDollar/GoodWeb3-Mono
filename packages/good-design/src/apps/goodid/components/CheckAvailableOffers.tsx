import React, { FC, useEffect } from "react";
import { PoolCriteria } from "@gooddollar/web3sdk-v2";
import { Spinner } from "native-base";

import { RedtentController } from "../controllers/RedtentController";
import { isNull } from "lodash";

interface CheckAvailableOffersProps {
  account: string;
  onDone: (e?: Error) => Promise<void>;
  availableOffers: false | PoolCriteria[] | null;
  withNavBar: boolean;
  // pools: any;
}

const CheckAvailableOffers: FC<CheckAvailableOffersProps> = ({ account, availableOffers, withNavBar, onDone }) => {
  useEffect(() => {
    if (availableOffers === false || availableOffers?.length === 0) {
      void onDone();
    }
  }, [availableOffers]);

  // If isNull means we are still waiting for the availableOffers to be fetched
  // else we are just waiting on onDone to handle the next step / navigation
  if (isNull(availableOffers) || availableOffers === false || availableOffers.length === 0)
    return <Spinner variant="page-loader" size="lg" />;

  return (
    /* todo-next: Currently hardcoded for redtent campaign, this should handle showing list of offers. needs design */
    <RedtentController
      {...{
        withNavBar,
        account,
        availableOffers,
        onDone
      }}
    />
  );
};

export default CheckAvailableOffers;
