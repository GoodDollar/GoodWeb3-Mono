import { memoize } from "lodash";
// import { createIPFSLoader } from "ipfs-utils";
import { IpfsStorage, isValidCID } from "../../ipfs";
// import { FetcherFactory, StreamFetcher } from "../types";
import { G$FeedConfig, StreamPost } from "./types";

//reference: https://github.com/OrbisWeb3/orbis-sdk/blob/f8a4f853ce9df25f4988958ab7ff38aa5f70a6b1/lib/indexer-db.js#L1
const indexerUrl = "https://ylgfjdlgyjmdikqavpcj.supabase.co";
const indexerKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ2ZqZGxneWptZGlrcWF2cGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTQ3NTc3NTIsImV4cCI6MTk3MDMzMzc1Mn0.2XdkerM98LhI6q5MBBaXRq75yxOSy-JVbwtTz6Dn9d0";

const filterDefaults = {
  q_did: null,
  q_only_master: false,
  q_contexts: null,
  q_master: null,
  q_reply_to: null,
  q_include_child_contexts: false,
  q_term: null,
  q_is_reply: null,
  q_is_repost: null
};

const getIndexer = memoize(async () => {
  const { createClient } = await import("@supabase/supabase-js");

  return createClient(indexerUrl, indexerKey);
});

export const getOrbisPost = async (post_id: string) => {
  const api = await getIndexer();

  return api.from("orbis_v_posts_v2").select().eq("stream_id", post_id).single();
};

//reference: https://github.com/OrbisWeb3/orbis-sdk/blob/f8a4f853ce9df25f4988958ab7ff38aa5f70a6b1/index.js#L1495
const getOrbisPosts = async (filter: Pick<G$FeedConfig, "context" | "tag">, limit: number, offset?: number) => {
  const skip = offset ?? 0;
  const { context, tag } = filter;
  const api = await getIndexer();

  return api
    .rpc("default_posts_09", {
      ...filterDefaults,
      q_context: context ?? null,
      q_tag: tag ?? null
    })
    .range(skip, skip + limit > 0 ? skip + limit - 1 : 0)
    .order("timestamp", { ascending: false })
    .then(
      ({ data }) =>
        data as {
          stream_id: string;
          content: {
            title: string;
            body: string;
            data: unknown;
          };
        }[]
    );
};

// todo: define FetcherFactory<G$FeedConfig>
export const createG$Fetcher: any = <T extends StreamPost = StreamPost>({ context, tag }: G$FeedConfig): any => {
  const ipfs = new IpfsStorage();
  const loadPicture = ipfs.load;

  const getPosts = async (limit: number, offset?: number) => {
    const filter = { context, tag };
    const orbisPosts = await getOrbisPosts(filter, limit, offset);

    const streamPosts = (orbisPosts ?? []).map(({ stream_id, content: { title, body, data } }) => ({
      ...(data as T),
      id: stream_id,
      title: title,
      content: body
    }));

    return Promise.all(
      streamPosts.map(async post => {
        const { picture } = post;

        return isValidCID(picture) ? { ...post, picture: await loadPicture(picture) } : post;
      })
    );
  };

  const getPost = async (post_id: string) => {
    const { data } = await getOrbisPost(post_id);

    return {
      ...(data as T),
      id: post_id
    };
  };

  return { getPosts, getPost };
};
