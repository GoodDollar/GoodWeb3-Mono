import React, { useEffect, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View, Text } from "react-native";

import { W3Wrapper } from "../W3Wrapper";
import { createNewsFeedStorage } from "../../sdk/storage/newsfeedstorage/sdk";
import { FeedPost } from "../../sdk";

// export interface PageProps

const Web3Component = (params: object) => {
  const [feed, setFeed] = useState<FeedPost[] | null>(null);

  console.log("params -->", { params });

  const { db } = createNewsFeedStorage();

  useEffect(async () => {
    if (!feed && db) {
      const posts = await db.posts.toArray();

      setFeed(posts);
    }
  }, [feed]);

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
  <W3Wrapper withMetaMask={false}>
    <Web3Component {...params} />
  </W3Wrapper>
);

export default {
  title: "News feed with dexie storage",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = Page;

export const NewsFeedSDKExample = Template.bind({});
