import React, { createContext, useEffect, useState } from "react";
import { FeedPost, createFeedWithPictures, createNewsFeedStorage } from "../../sdk";

type INewsFeedContext = {
  env: string;
  db: any;
  feed: FeedPost[] | null;
};

export const NewsFeedContext = createContext<INewsFeedContext>({
  env: "qa",
  db: null,
  feed: null
});

interface INewsFeedProvider {
  children: any;
  env: string;
  ipfsUrls: {
    ipfsGateWays: string;
    ipfsUploadGateway: string;
    ceramicNodeUrl: string;
  };
  ceramicConfig: {
    devCeramicNodeURL: string;
    ceramicIndex: string;
    ceramicLiveIndex: string;
  };
}

export const NewsFeedProvider = ({ children, env, ipfsUrls, ceramicConfig }: INewsFeedProvider) => {
  const { db } = createNewsFeedStorage(env ?? "qa", ceramicConfig, ipfsUrls);
  const [feed, setFeed] = useState<FeedPost[] | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      const posts = await db.posts.toArray();
      const feed = createFeedWithPictures(posts);
      setFeed(feed);
    };

    if (!feed) {
      void fetchFeed();
    }
  }, [db]);

  return (
    <NewsFeedContext.Provider
      value={{
        env: env ?? "qa",
        db: db,
        feed: feed
      }}
    >
      {children}
    </NewsFeedContext.Provider>
  );
};
