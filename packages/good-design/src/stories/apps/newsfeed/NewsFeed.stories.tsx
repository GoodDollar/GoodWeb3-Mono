import React, { useContext } from "react";

import { NewsFeed } from "../../../apps/newsfeed";

import { NewsFeedContext, NewsFeedProvider } from "@gooddollar/web3sdk-v2";

const devConfig = {
  env: "qa",
  ceramicConfig: {
    devCeramicNodeURL: "https://ceramic-clay.3boxlabs.com",
    ceramicIndex: "k2t6wyfsu4pg10xd3qcu4lfbgk6u2r1uwdyggfchpk77hxormr4wvqkitqvkce",
    ceramicLiveIndex: "k2t6wyfsu4pg26i4h73gc5kdjis5rtfxg62wd93su31ldxfeacl6rx5cs1nix5"
  },
  ipfsUrls: {
    ipfsGateways:
      "https://{cid}.ipfs.nftstorage.link,https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link",
    ipfsUploadGateway: "https://ipfsgateway.goodworker.workers.dev"
  }
};

const NewsFeedStorageWrapper = ({ children }) => {
  const { env, ceramicConfig, ipfsUrls } = devConfig;
  return (
    <NewsFeedProvider env={env} ceramicConfig={ceramicConfig} ipfsUrls={ipfsUrls}>
      {children}
    </NewsFeedProvider>
  );
};

const NewsFeedWidget = (params: object) => {
  const { feed } = useContext(NewsFeedContext);

  if (!feed) return null;

  return <NewsFeed feed={feed} />;
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
