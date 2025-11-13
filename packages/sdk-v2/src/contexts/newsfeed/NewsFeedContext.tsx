import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { FeedFilter, FeedPost, StrapiCachedFeed } from "../../sdk/newsfeed/StrapiCachedFeed";
import { IPFSUrls, IpfsStorage } from "../../sdk/ipfs/sdk";
import { Envs } from "../../sdk";

type INewsFeedContext = {
  feed: FeedPost[];
};

export const NewsFeedContext = createContext<INewsFeedContext>({
  feed: []
});

export interface INewsFeedProvider {
  children: any;
  feedFilter?: FeedFilter;
  env: string;
  newsfeedUrl?: string;
  ipfsUrls?: IPFSUrls;
  enablePeriodicSync?: boolean;
  limit?: number;
}

const feedConfig = {
  development: {
    feedFilter: {
      context: "kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os",
      tag: "publishDapp"
    }
  },
  staging: {
    feedFilter: {
      context: "kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os",
      tag: "publishDapp"
    }
  },
  production: {
    feedFilter: {
      context: "kjzl6cwe1jw149ao1fmo5ip9866yqmyt2wpf6zaeinam7w02s00pdeitldtmjxc",
      tag: "publishDapp"
    }
  }
};

export const NewsFeedProvider = ({
  children,
  feedFilter,
  env,
  newsfeedUrl,
  ipfsUrls,
  enablePeriodicSync = true,
  limit = 5
}: INewsFeedProvider) => {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const resolvedFeedFilter = env && feedConfig[env] ? feedConfig[env].feedFilter : feedFilter;
  const baseUrl = Envs[env]?.newsfeed ?? newsfeedUrl;

  const normalizedFilter: FeedFilter = resolvedFeedFilter ?? {};
  const ipfsConfigKey = JSON.stringify(ipfsUrls ?? {});

  const newsFeedDb = useMemo(
    () =>
      new StrapiCachedFeed(normalizedFilter, new IpfsStorage(ipfsUrls), {
        env: env,
        baseUrl: baseUrl
      }),
    [normalizedFilter.context, normalizedFilter.tag, ipfsConfigKey, baseUrl]
  );

  const fetchFeed = useCallback(async () => {
    const posts = await newsFeedDb.getPosts(0, limit);
    setFeed(posts);
  }, [limit, newsFeedDb]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (enablePeriodicSync) {
      void newsFeedDb.periodicSync(fetchFeed);
    } else {
      newsFeedDb.syncPosts().then(fetchFeed);
    }
  }, [enablePeriodicSync, fetchFeed, newsFeedDb]);

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
