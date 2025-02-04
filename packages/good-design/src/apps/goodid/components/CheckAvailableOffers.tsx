import React, { FC, useEffect, useState } from "react";
import { PoolCriteria, useCheckAvailableOffers, useGetUBIPoolsDetails } from "@gooddollar/web3sdk-v2";
import { Spinner } from "native-base";

import { RedtentController } from "../controllers/RedtentController";
import { useClaimContext } from "../../ubi";

export type UBIPoolOffer = PoolCriteria & { claimAmount?: string; claimDayFrequency?: string };
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
const redtentProdPools: { [key: string]: string } = {
  NG: "0xDd1c12f197E6D1E2FBA15487AaAE500eF6e07BCA",
  CO: "0x0d43131f1577310D6349bAF9D6Da4fC1Cd39764C"
};
const redtentDevPools: { [key: string]: string } = {
  NG: "0x77253761353271813c1aca275de8eec768b217c5",
  CO: "0x627dbf00ce1a54067f5a34d6596a217a029c1532"
};

const CheckAvailableOffers: FC<CheckAvailableOffersProps> = ({
  account,
  isDev = false,
  withNavBar,
  onDone,
  onError
}) => {
  const redtentPools = isDev ? redtentDevPools : redtentProdPools;
  const { activePoolAddresses, poolContracts } = useClaimContext();
  const poolsDetails = useGetUBIPoolsDetails(Object.values(redtentPools));
  const availableOffers = useCheckAvailableOffers({ account, pools: redtentOffer, isDev, onDone });
  const [hasOffer, setHasOffer] = useState([] as UBIPoolOffer[]);

  useEffect(() => {
    const isMember = poolContracts?.some(pool =>
      Object.values(activePoolAddresses).includes(pool.address.toLowerCase())
    );

    if (availableOffers === false || availableOffers?.length === 0 || isMember) {
      void onDone?.(true);
      return;
    }

    if (availableOffers && poolsDetails) {
      const offers = availableOffers
        .map(offer => {
          const pool = redtentPools[offer.Location?.countryCode || ""];
          const poolDetails = poolsDetails.find(_ => _.contract.toLowerCase() === pool.toLowerCase());

          const isAvailable =
            poolDetails?.ubiSettings.onlyMembers === false ||
            Number(poolDetails?.ubiSettings.maxMembers) >= Number(poolDetails?.status.membersCount);

          if (isAvailable) {
            return {
              ...offer,
              claimAmount: poolDetails?.nextClaimAmount as string,
              claimDayFrequency: poolDetails?.ubiSettings.claimPeriodDays as string
            } as UBIPoolOffer;
          }
          return undefined;
        })
        .filter(_ => _ !== undefined) as UBIPoolOffer[];

      if (offers.length > 0) {
        setHasOffer(offers);
        return;
      }
      void onDone?.(true);
    }
  }, [availableOffers, /*used*/ activePoolAddresses, /*used*/ poolContracts, poolsDetails]);

  // If isNull means we are still waiting for the availableOffers to be fetched
  // else we are just waiting on onDone to handle the next step / navigation
  if (!hasOffer || hasOffer.length === 0) return <Spinner variant="page-loader" size="lg" />;

  return (
    /* todo-next: Currently hardcoded for redtent campaign, this should handle showing list of offers. needs design */
    <RedtentController
      {...{
        withNavBar,
        account,
        availableOffers: hasOffer,
        onDone,
        onError
      }}
    />
  );
};

export default CheckAvailableOffers;
