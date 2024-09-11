import React, { useState, useEffect } from "react";
import { View, Button, Modal, Text, StyleSheet, Linking, ModalProps } from "react-native";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useEthers, QueryParams } from "@usedapp/core";
import { noop, isEmpty, isUndefined } from "lodash";

import { PoolDetails } from "../../sdk";
import { W3Wrapper } from "../W3Wrapper";
import { useFVLink, useGetMemberUBIPools, useClaim, useMultiClaim } from "../../sdk/claim/react";

export interface PageProps {
  address?: string;
  firstName: string;
}

export const FVModal = (params: ModalProps & { firstName: string }) => {
  const fvlink = useFVLink();
  const method = "popup";
  return (
    <Modal {...params} animationType="slide">
      <View style={styles.containeralt}>
        <View>
          <Text>To verify your identity you need to sign once with your wallet.</Text>
          <Text>
            Sign your self sovereign anonymized identifier, so no link is kept between your identity record and your
            address.
          </Text>
        </View>
        <Button
          onPress={async () => {
            await fvlink?.getFvSig();
          }}
          title={"Step 1 - Sign"}
        />
        <Button
          onPress={async () => {
            let link: string;
            if (method === "popup") {
              link = fvlink?.getLink(params.firstName, undefined, true);
              window.open(link, "_blank", "width: '800px', height: 'auto'");
            } else {
              link = fvlink?.getLink(params.firstName, document.location.href, false);
              link && void Linking.openURL(link);
            }
            // console.log({ link });
            params.onRequestClose?.(noop as any);
          }}
          title={"Step 2 - Verify"}
        />
        <Button color="red" onPress={() => params.onRequestClose?.(noop as any)} title="Close" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  containeralt: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#eee",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    height: 300,
    margin: "auto",
    padding: 30,
    width: 600
  },
  gap: {
    height: 10
  }
});

export const getUnclaimedPools = (pools: PoolDetails[] | undefined) =>
  pools?.filter(pool => {
    const claimsRemaining = Object.values(pool)[0] as any;
    return !claimsRemaining.hasClaimed;
  });

const MultiClaim = () => {
  const { account } = useEthers();
  const [refreshRate, setRefreshRate] = useState<QueryParams["refresh"]>(4);
  const claimDetails = useClaim(refreshRate);
  const { poolsDetails, loading, fetchPools } = useGetMemberUBIPools();
  const [preClaimPools, setPreClaimPools] = useState<any[] | undefined>(undefined);
  const { startClaiming, poolContracts, claimFlowStatus } = useMultiClaim(preClaimPools);

  //Handle navigation to pre-claim screen
  useEffect(() => {
    if (!isEmpty(poolContracts) && poolsDetails === undefined) return;
    const unclaimedPools = getUnclaimedPools(poolsDetails);

    if (
      account &&
      preClaimPools === undefined &&
      !loading &&
      !isUndefined(claimDetails.hasClaimed) &&
      (claimDetails.hasClaimed === false || !isEmpty(unclaimedPools))
    ) {
      let details: any[] = !claimDetails.hasClaimed ? [{ GoodDollar: claimDetails }] : [];

      if (!isEmpty(unclaimedPools) && unclaimedPools) {
        details.push(...unclaimedPools);
      }

      // the claimReceipts are more reliable because of immediate availibilty,
      // opposed to fetching latest data from chain
      if (claimFlowStatus.claimReceipts) {
        const alreadyClaimed = claimFlowStatus.claimReceipts.filter(Boolean).map(receipt => receipt.to);

        details = details.filter(pool => !alreadyClaimed.includes(Object.values(pool as PoolDetails)[0].address));
      }

      setPreClaimPools(details);
    }
  }, [account, claimDetails, claimFlowStatus.claimReceipts, preClaimPools, poolContracts, poolsDetails]);

  useEffect(() => {
    if (claimFlowStatus.remainingClaims === 0 && claimFlowStatus.error) {
      setRefreshRate("everyBlock");
      void fetchPools();

      setTimeout(() => {
        setPreClaimPools(undefined);
      }, 1000);
    } else if (claimFlowStatus.isClaimingDone) {
      alert("All claims done!, a post-claim screen should be shown");
    }
  }, [claimFlowStatus.isClaimingDone, claimFlowStatus.remainingClaims]);

  return (
    <View>
      {preClaimPools ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            maxWidth: 400,
            marginBottom: 10
          }}
        >
          {preClaimPools.map((pool, i) =>
            Object.values(pool as PoolDetails).map(details => (
              <View key={i} style={{ paddingLeft: 12 }}>
                <Text>PoolName: {details.contractName}</Text>
                <Text>HasClaimed: {details.hasClaimed.toString()}</Text>
                <Text>Address: {details.address} </Text>
              </View>
            ))
          )}
        </View>
      ) : (
        <View>
          <Text>Loading....</Text>
        </View>
      )}
      <Button onPress={startClaiming} title="Start Claiming" />
      <View style={{ marginTop: 10, marginBottom: 10 }}>
        {claimFlowStatus ? (
          <View>
            <Text>Is Claiming: {claimFlowStatus.isClaiming.toString()}</Text>
            <Text>Is Claiming Done: {claimFlowStatus.isClaimingDone.toString()}</Text>
            <Text>Remaining Claims: {claimFlowStatus.remainingClaims?.toString()}</Text>
            <Text>Error: {claimFlowStatus.error.toString()}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export const UseMultiClaim = () => (
  <W3Wrapper withMetaMask={true}>
    <MultiClaim />
  </W3Wrapper>
);

const ClaimPools = () => {
  const { poolsDetails, loading } = useGetMemberUBIPools();

  if (loading || !poolsDetails?.length) {
    return <Text>No active pools</Text>;
  }

  return Object.values(poolsDetails[0]["RedTent"]).map(({ isRegistered, claimTime, claimAmount }) => (
    <View key={"test"}>
      <Text>Registered: {`${isRegistered}`}</Text>
      <Text>Next claim time: {claimTime.toString()}</Text>
      <Text>Claim amount: {claimAmount.toString()}</Text>
    </View>
  ));
};

export const UbiClaimPools = (params: PageProps) => {
  console.log({ params });
  return (
    <W3Wrapper withMetaMask={true}>
      <ClaimPools />
    </W3Wrapper>
  );
};

const Page = (params: PageProps) => {
  console.log({ params });
  return (
    <W3Wrapper withMetaMask={true}>
      <></>
    </W3Wrapper>
  );
};

export default {
  title: "Claim Flow Example - Hooks",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = (args: any) => {
  console.log("args", args);
  return (
    <W3Wrapper withMetaMask={true}>
      <></>
    </W3Wrapper>
  );
};

export const ClaimFlowExample = Template.bind({});
ClaimFlowExample.args = {
  address: "",
  firstName: "John"
};
