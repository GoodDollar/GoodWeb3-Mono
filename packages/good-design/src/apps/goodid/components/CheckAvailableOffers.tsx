import React, { useEffect } from "react";
import { PoolCriteria } from "@gooddollar/web3sdk-v2";
import { Spinner } from "native-base";

import { RedtentController } from "../controllers/RedtentController";
import { isNull } from "lodash";

interface CheckAvailableOffersProps {
  account: string;
  onDone: (e?: Error) => Promise<void>;
  availableOffers: false | PoolCriteria[] | null;
  // pools: any;
}

const CheckAvailableOffers: React.FC<CheckAvailableOffersProps> = ({ account, availableOffers, onDone }) => {
  useEffect(() => {
    if (availableOffers === false || availableOffers?.length === 0) {
      onDone();
    }
  }, [availableOffers]);

  if (isNull(availableOffers)) return <Spinner variant="page-loader" size="lg" />;

  return availableOffers === false || availableOffers.length === 0 ? (
    <></>
  ) : (
    /* todo-next: Currently hardcoded for redtent campaign, this should handle showing list of offers. needs design */
    <RedtentController onDone={onDone} account={account} />
  );
};

export default CheckAvailableOffers;
