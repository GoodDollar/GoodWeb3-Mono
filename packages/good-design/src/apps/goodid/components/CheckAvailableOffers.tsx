import React, { useEffect } from "react";
import { useCheckAvailableOffers } from "@gooddollar/web3sdk-v2";
import { Spinner } from "native-base";

import { RedtentController } from "../controllers/RedtentController";
import { isNull } from "lodash";

interface CheckAvailableOffersProps {
  account: string;
  onDone: (e?: Error) => Promise<void>;
}

//todo: add actual criteria
const redtentOffer = [
  {
    campaign: "RedTent",
    Location: {
      countryCode: "JP"
    },
    Age: {
      min: 18,
      max: 65
    },
    Gender: "Male"
  }
];

const CheckAvailableOffers: React.FC<CheckAvailableOffersProps> = ({ account, onDone }) => {
  const availableOffers = useCheckAvailableOffers({ account, pools: redtentOffer });

  useEffect(() => {
    if (availableOffers === false) {
      onDone();
    }
  }, [availableOffers]);

  if (isNull(availableOffers))
    return <Spinner borderWidth="0" size="lg" color="primary" accessibilityLabel="Loading posts" paddingBottom={4} />;

  return availableOffers === false || availableOffers.length === 0 ? (
    <></>
  ) : (
    /* todo-next: Currently hardcoded for redtent campaign, this should handle showing list of offers. needs design */
    <RedtentController onDone={onDone} account={account} />
  );
};

export default CheckAvailableOffers;
