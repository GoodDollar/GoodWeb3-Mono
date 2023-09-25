import React, { useEffect, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View, Text } from "react-native";

import { W3Wrapper } from "../W3Wrapper";

import NewsFeed, { FeedItems } from "../../sdk/newsfeed/sdk";

// export interface PageProps {}

const Web3Component = (params: object) => {
  const [initialFeed, setInitialFeed] = useState<FeedItems[] | null>(null);

  const getPosts = async () => {
    const test = await NewsFeed.getPosts();
    return test;
  };

  useEffect(async () => {
    console.log({ params });
    if (!initialFeed) {
      const latestNewFeed = await getPosts();
      setInitialFeed(latestNewFeed);
    }
  }, [getPosts, initialFeed]);

  return (
    <View>
      <Text>News feed</Text>
      {initialFeed &&
        initialFeed.map(item => (
          <View
            style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 20, marginBottom: 16 }}
          >
            <Text>id: {item.id}</Text>
            <Text>title: {item.title}</Text>
            <Text>link: {item.link}</Text>
            <Text>content: {item.content}</Text>
            <Text>picture: {item.picture}</Text>
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
