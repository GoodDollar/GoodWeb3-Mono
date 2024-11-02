import React, { useContext } from "react";

import { NewsFeed } from "../../../apps/newsfeed";

import { NewsFeedContext, NewsFeedProvider } from "@gooddollar/web3sdk-v2";

const NewsFeedStorageWrapper = ({ children }) => {
  return <NewsFeedProvider env="qa">{children}</NewsFeedProvider>;
};

const NewsFeedWidget = () => {
  const { feed } = useContext(NewsFeedContext);

  if (!feed) return null;

  return <NewsFeed feed={feed} direction="row" variant="multiRow" />;
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
