import React, { useEffect, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View, Text } from "react-native";

import { W3Wrapper } from "../W3Wrapper";

import createCeramicFeed, { FeedItems } from "../../sdk/newsfeed/sdk";
import type { CeramicFeed } from "../../sdk/newsfeed/sdk";

// export interface PageProps {}

const devConfig = {
  devCeramicNodeURL: "https://ceramic-clay.3boxlabs.com",
  ceramicIndex: "k2t6wyfsu4pg10xd3qcu4lfbgk6u2r1uwdyggfchpk77hxormr4wvqkitqvkce",
  ceramicLiveIndex: "k2t6wyfsu4pg26i4h73gc5kdjis5rtfxg62wd93su31ldxfeacl6rx5cs1nix5"
};

const Web3Component = (params: object) => {
  const [initialFeed, setInitialFeed] = useState<FeedItems[] | null>(null);
  const { devCeramicNodeURL, ceramicIndex, ceramicLiveIndex } = devConfig;
  const NewsFeed: CeramicFeed = new createCeramicFeed(devCeramicNodeURL, ceramicIndex, ceramicLiveIndex);

  const getPosts = async () => {
    const test = await NewsFeed.getPosts();
    return test;
  };

  useEffect(async () => {
    console.log({ params });
    if (!initialFeed) {
      const latestNewsFeed = await getPosts();

      setInitialFeed(latestNewsFeed);
    }
  }, [getPosts, initialFeed]);

  return (
    <View>
      <Text>News feed</Text>
      {initialFeed &&
        initialFeed.map(item => (
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
  <W3Wrapper withMetaMask={false}>
    <Web3Component {...params} />
  </W3Wrapper>
);

export default {
  title: "News feed example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const NewsFeedSDKExample = Template.bind({});
