import React, { useContext } from "react";

import { NewsFeed } from "../../../apps/newsfeed";

import { NewsFeedContext, NewsFeedProvider } from "@gooddollar/web3sdk-v2";
import { Center } from "native-base";

const NewsFeedStorageWrapper = ({ children }) => {
  return <NewsFeedProvider env="qa">{children}</NewsFeedProvider>;
};

const NewsFeedWidget = () => {
  const { feed } = useContext(NewsFeedContext);

  if (!feed) return null;

  return (
    <Center width={375}>
      <NewsFeed feed={feed} withHeader />
    </Center>
  );
};

export default {
  title: "Apps/NewsFeedWidget",
  component: NewsFeedWidget,
  decorators: [
    (Story: any) => (
      <NewsFeedStorageWrapper>
        <Story />
      </NewsFeedStorageWrapper>
    )
  ],
  argTypes: {}
};

export const NewsFeedStory = {
  args: {}
};
