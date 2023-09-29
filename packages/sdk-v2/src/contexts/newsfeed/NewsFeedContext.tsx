import React, { createContext, useEffect, useRef, useState } from "react";
import { FeedPost, createNewsFeedStorage } from "../../sdk";

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
  const [feed, setFeed] = useState<FeedPost[] | null>(null);
  const newsFeedDb = useRef<any>();

  useEffect(() => {
    const fetchFeed = async () => {
      const { db } = createNewsFeedStorage(env ?? "qa", ceramicConfig, ipfsUrls);
      const posts = await db.posts.toArray();
      newsFeedDb.current = db;
      setFeed(posts);
    };

    if (!feed) {
      void fetchFeed();
    }
  }, [feed]);

  return (
    <NewsFeedContext.Provider
      value={{
        env: env ?? "qa",
        db: newsFeedDb,
        feed: feed
      }}
    >
      {children}
    </NewsFeedContext.Provider>
  );
};
