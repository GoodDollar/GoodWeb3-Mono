import React, { useContext } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View, Text } from "react-native";

import { NewsFeedContext, NewsFeedProvider } from "../../contexts/newsfeed/NewsFeedContext";

// export interface PageProps

const NewsFeedStorageWrapper = ({ children }) => {
  return <NewsFeedProvider env={"development"}>{children}</NewsFeedProvider>;
};

const Web3Component = () => {
  const { feed } = useContext(NewsFeedContext);

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
            <Text>updated: {item.updated}</Text>

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
