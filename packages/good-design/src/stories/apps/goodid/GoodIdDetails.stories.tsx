import React from "react";
import { useEthers } from "@usedapp/core";
import { View } from "native-base";
import { isEmpty } from "lodash";
import { W3Wrapper } from "../../W3Wrapper";
import { GoodIdContextProvider } from "@gooddollar/web3sdk-v2";
import { GoodIdDetails } from "../../../apps/goodid";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

export const GoodIdDetailsScreen = {
  render: (args: any) => {
    const { account = "" } = useEthers();

    const styles = Object.values(args.styles).filter((styleprop: any) => !isEmpty(styleprop));

    return (
      <View>
        <GoodIdWrapper>
          <W3Wrapper withMetaMask={true} env="fuse">
            <GoodIdDetails account={account} withHeader={true} {...styles} />
          </W3Wrapper>
        </GoodIdWrapper>
      </View>
    );
  },
  args: {
    account: "0x25a65fAaFb6168a3B05da736d9Df018F62608e83",
    styles: {
      container: {},
      header: {},
      section: {},
      innerContainer: {
        width: "100%"
      }
    }
  }
};

export default {
  title: "Apps/GoodIdDetails",
  component: GoodIdDetails,
  decorators: [
    (Story: any) => (
      <W3Wrapper withMetaMask={true} env="fuse">
        <Story />
      </W3Wrapper>
    )
  ],
  argTypes: {}
};
