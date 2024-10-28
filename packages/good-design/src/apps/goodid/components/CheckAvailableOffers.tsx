import React, { FC, useEffect, useState } from "react";
import { useCheckAvailableOffers } from "@gooddollar/web3sdk-v2";
import { Spinner } from "native-base";
import { isEmpty, isNull } from "lodash";

import { RedtentController } from "../controllers/RedtentController";
import { useClaimContext } from "../../ubi";

export interface CheckAvailableOffersProps {
  account: string;
  withNavBar: boolean;
  chainId: number;
  isDev?: boolean;
  onDone: (e?: Error | boolean | undefined) => Promise<void>;
  onError?: (e: Error | undefined) => void;
  onExit?: () => void;
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
];

const CheckAvailableOffers: FC<CheckAvailableOffersProps> = ({
  account,
  isDev = false,
  withNavBar,
  onDone,
  onError
}) => {
  const { activePoolAddresses, poolContracts } = useClaimContext();
  const availableOffers = useCheckAvailableOffers({ account, pools: redtentOffer, isDev, onDone });
  const [alreadyMember, setAlreadyMember] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const isMember = poolContracts?.some(pool => activePoolAddresses.includes(pool.address.toLowerCase()));
    setAlreadyMember(isMember);

    if (availableOffers === false || availableOffers?.length === 0 || isMember) {
      void onDone?.(true);
    }
  }, [availableOffers, activePoolAddresses, poolContracts]);

  // If isNull means we are still waiting for the availableOffers to be fetched
  // else we are just waiting on onDone to handle the next step / navigation
  if (
    isNull(availableOffers) ||
    availableOffers === false ||
    availableOffers?.length === 0 ||
    alreadyMember !== false ||
    isEmpty(poolContracts)
  )
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
