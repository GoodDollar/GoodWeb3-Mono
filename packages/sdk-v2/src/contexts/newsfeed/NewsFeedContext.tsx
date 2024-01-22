import React, { createContext, useCallback, useEffect, useState } from "react";
import { FeedFilter, FeedPost } from "../../sdk/newsfeed/OrbisCachedFeed";
import { OrbisCachedFeed } from "../../sdk/newsfeed/OrbisCachedFeed";
import { IPFSUrls } from "../../sdk/ipfs/sdk";

type INewsFeedContext = {
  feed: FeedPost[];
};

export const NewsFeedContext = createContext<INewsFeedContext>({
  feed: []
});

interface INewsFeedProvider {
  children: any;
  feedFilter?: FeedFilter;
  env?: string;
  ipfsUrls?: IPFSUrls;
  enablePeriodicSync?: boolean;
  limit?: number;
}

const feedConfig = {
  qa: {
    feedFilter: {
      context: "kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os",
      tag: "publishDapp"
    }
  }
};

export const defaultIPFS: IPFSUrls = {
  ipfsGateways:
    "https://{cid}.ipfs.nftstorage.link,https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link",
  ipfsUploadGateway: "https://ipfsgateway.goodworker.workers.dev"
};

export const NewsFeedProvider = ({
  children,
  feedFilter,
  env,
  ipfsUrls,
  enablePeriodicSync = true,
  limit = 5
}: INewsFeedProvider) => {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const newsFeedDb = new OrbisCachedFeed(env ? feedConfig[env].feedFilter : feedFilter, ipfsUrls ?? defaultIPFS);

  const fetchFeed = useCallback(async () => {
    const posts = await newsFeedDb.getPosts(0, limit);
    setFeed(posts);
  }, [newsFeedDb]);

  useEffect(() => {
    void fetchFeed();
  }, []);

  useEffect(() => {
    if (enablePeriodicSync) {
      void newsFeedDb.periodicSync(fetchFeed);
    } else {
      newsFeedDb.syncPosts().then(fetchFeed);
    }
  }, [enablePeriodicSync]);

  return (
    <NewsFeedContext.Provider
      value={{
        feed: feed
      }}
    >
      {children}
    </NewsFeedContext.Provider>
  );
};
