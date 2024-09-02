import React from "react";
import { View, Button, Modal, Text, StyleSheet, Linking, ModalProps } from "react-native";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { W3Wrapper } from "../W3Wrapper";
import { useFVLink, useGetMemberUBIPools } from "../../sdk/claim/react";
import { noop } from "lodash";

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

// const ClaimButton = ({ address, firstName }: PageProps) => {
//   // const library = useSDK(true, "claim");
//   const [showModal, setShowModal] = useState(false);
//   const [refresh, setRefresh] = useState(false);
//   const hasClaimed = useHasClaimed("FUSE");
//   const { isWhitelisted, claimAmount, claimTime } = useClaim(refresh ? "everyBlock" : "never");
//   const handleClaim = async () => {
//     if (isWhitelisted) {
//       await claimCall.send();
//     } else {
//       setShowModal(true);
//     }
//   };

//   // const onClaim = usePressOrSwitchChain({ chainId: 122, onPress: handleClaim });
//   useEffect(() => {
//     if (!isWhitelisted || claimCall.state.status === "Mining" || claimCall.state.status === "PendingSignature") {
//       setRefresh(true);
//     } else setRefresh(false);
//   }, [isWhitelisted, claimCall.state]);

//   const buttonTitle = () => {
//     if (isWhitelisted) {
//       if (claimAmount.gt(0)) return `Claim ${claimAmount}`;
//       else return `Claim at: ${claimTime}`;
//     } else return "Verify Uniqueness";
//   };

//   return (
//     <View>
//       <View style={styles.container}>
//         <Text>address: {address}</Text>
//         <Text>hasClaimed: {String(hasClaimed)}</Text>
//         <Text>isWhitelisted: {String(isWhitelisted)}</Text>
//         <Text>Claim time: {claimTime?.toString()}</Text>
//         <Text>Claim amount: {claimAmount?.toString()}</Text>
//         <FVModal visible={showModal} onRequestClose={() => setShowModal(false)} firstName={firstName}></FVModal>
//       </View>
//       <Button title={buttonTitle()} onPress={handleClaim}></Button>
//     </View>
//   );
// };

const ClaimPools = () => {
  const { poolsDetails, loading } = useGetMemberUBIPools();

  if (loading || !poolsDetails?.length) {
    return <Text>No active pools</Text>;
  }

  return poolsDetails[0]["RedTent"].map(({ isRegistered, claimTime, claimAmount }) => (
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
