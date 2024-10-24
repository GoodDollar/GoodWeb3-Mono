import React from "react";
import { useEthers } from "@usedapp/core";
import { HStack, View } from "native-base";
import { isEmpty } from "lodash";
import { W3Wrapper } from "../../W3Wrapper";
import { GoodIdContextProvider } from "@gooddollar/web3sdk-v2";
import { Provider } from "react-native-paper";

import { GoodIdDetails, GoodIdProvider } from "../../../apps/goodid";
import { GoodUIi18nProvider, useGoodUILanguage } from "../../../theme";
import { GoodButton } from "../../../core";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

export const GoodIdDetailsScreen = {
  render: (args: any) => {
    const { account = "" } = useEthers();
    const { setLanguage } = useGoodUILanguage();
    const styles = Object.values(args.styles).filter((styleprop: any) => !isEmpty(styleprop));

    return (
      <Provider>
        <GoodIdProvider>
          <View>
            <HStack width="200">
              <GoodButton onPress={() => setLanguage("en")}>English</GoodButton>
              <GoodButton onPress={() => setLanguage("es-419")}>Spanish</GoodButton>
            </HStack>
            <GoodIdWrapper>
              <W3Wrapper withMetaMask={true} env="fuse">
                <GoodIdDetails account={account} withHeader={true} {...styles} />
              </W3Wrapper>
            </GoodIdWrapper>
          </View>
        </GoodIdProvider>
      </Provider>
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
      <GoodUIi18nProvider>
        <W3Wrapper withMetaMask={true} env="fuse">
          <Story />
        </W3Wrapper>
      </GoodUIi18nProvider>
    )
  ],
  argTypes: {}
};
