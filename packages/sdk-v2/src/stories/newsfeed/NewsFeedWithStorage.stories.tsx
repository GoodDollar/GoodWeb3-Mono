import React, { useContext } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View, Text } from "react-native";

import { NewsFeedContext, NewsFeedProvider } from "../../contexts/newsfeed/NewsFeedContext";

// export interface PageProps

const devConfig = {
  env: "qa",
  ceramicConfig: {
    devCeramicNodeURL: "https://ceramic-clay.3boxlabs.com",
    ceramicIndex: "k2t6wyfsu4pg10xd3qcu4lfbgk6u2r1uwdyggfchpk77hxormr4wvqkitqvkce",
    ceramicLiveIndex: "k2t6wyfsu4pg26i4h73gc5kdjis5rtfxg62wd93su31ldxfeacl6rx5cs1nix5"
  },
  ipfsUrls: {
    ipfsGateways:
      "https://{cid}.ipfs.nftstorage.link,https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link",
    ipfsUploadGateway: "https://ipfsgateway.goodworker.workers.dev"
  }
};

const NewsFeedStorageWrapper = ({ children }) => {
  const { env, ceramicConfig, ipfsUrls } = devConfig;
  return (
    <NewsFeedProvider env={env} ceramicConfig={ceramicConfig} ipfsUrls={ipfsUrls}>
      {children}
    </NewsFeedProvider>
  );
};

const Web3Component = (params: object) => {
  const { feed } = useContext(NewsFeedContext);

  console.log("params -->", { params });

  return (
    <View>
      <Text>News feed items taken from storage</Text>
      {feed &&
        feed.map(item => (
          <View
            key={item.id}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 20, marginBottom: 16 }}
          >
            <Text>id: {item.id}</Text>
            <Text>title: {item.title}</Text>
            <Text>link: {item.link}</Text>
            <Text>content: {item.content}</Text>
            {item.picture && (
              <Text>
                picture: <img width="100" height="50" src={item.picture} alt="Image" />
              </Text>
            )}
            <Text>published: {item.published}</Text>
            {item.sponsored_link && <Text>sponsored_link: {item.sponsored_link}</Text>}
            <Text>hasSponsoredLogo: {!!item.sponsored_logo}</Text>
          </View>
        ))}
    </View>
  );
};
const Page = (params: object) => (
  <NewsFeedStorageWrapper>
    <Web3Component {...params} />
  </NewsFeedStorageWrapper>
);

export default {
  title: "News feed with dexie storage",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const NewsFeedSDKExample = Template.bind({});
