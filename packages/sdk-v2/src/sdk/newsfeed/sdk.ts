import { assign, countBy, filter, get, groupBy, isArray, keys, last, map } from "lodash";
import { CID } from "multiformats/cid";

import { CeramicModel as Post } from "./client";
import { batch, isValidCID, serializeCollection, serializeDocument } from "./utils";
import createIpfsStorage from "../ipfs/sdk";

// move configs to constructor
const ceramicBatchSize = 5;

export interface FeedPost {
  id: string;
  link: string;
  title: string;
  content: string;
  picture: CID;
  published: string;
  sponsored_link: string;
  sponsored_logo: string;
}

interface DocumentOrFeed {
  document: FeedPost[];
  picture: any;
}

export class CeramicFeed {
  Post: Post;
  IPFS: any;
  constructor(ceramicNodeUrl, ceramicIndex, ceramicLiveIndex) {
    this.Post = new Post({ ceramicNodeUrl, ceramicIndex, ceramicLiveIndex });
    this.IPFS = createIpfsStorage(fetch);
  }
  async getPost(postId: string) {
    const post = await this.Post.find(postId);
    const serialized = serializeDocument(post);

    // console.log("get ceramic post", { serialized });
    return this._loadPostPictures(serialized);
  }

  async getPosts(): Promise<DocumentOrFeed> {
    const feedPosts = await this.Post.all();
    const serialized = serializeCollection(feedPosts);

    // console.log("get ceramic posts collection", { serialized, feedPosts });
    return this._loadPostPictures(serialized);
  }

  async getHistory() {
    const { content } = await this.Post.getLiveIndex();
    const history = get(content, "items", []);
    const historyId = get(last(history), "id", null);

    return { history, historyId };
  }

  aggregateHistory(history, lastHistoryId = null) {
    const historyIds = map(history, "id");
    const historyId = last(historyIds);
    let lastChanges = history;

    console.log("get history", { historyId, historyIds, lastHistoryId });

    if (lastHistoryId) {
      const afterIndex = history.findIndex(({ id }) => id === lastHistoryId);

      if (afterIndex < 0) {
        const exception = new Error(`Couldn't find history id '${lastHistoryId}'`);

        assign(exception, {
          historyId: lastHistoryId,
          name: "HISTORY_NOT_FOUND"
        });

        throw exception;
      }

      lastChanges = history.slice(afterIndex + 1);
    }

    const aggregated = groupBy(lastChanges, "item");

    console.log("Got last changes:", { lastChanges });
    console.log("Got aggregated changes:", { aggregated });

    return filter(
      keys(aggregated).map(item => {
        let action;
        const records = aggregated[item];

        // read history of specific document, aggregate by the event count
        const { added = 0, removed = 0, updated = 0 } = countBy(records, "action");

        console.log("picking status for", { item, records, added, removed, updated });

        switch (Math.sign(added - removed)) {
          case -1:
            // if removed actions > added actions - remove item
            action = "removed";
            break;
          case 1:
            // if removed actions < added actions - add item
            action = "added";
            break;
          default: {
            // if removed equal added OR both removed/added were 0
            let shouldUpdate = false;

            if (added > 0) {
              // if there were 'added' and 'removed' - picking them
              const lastRecord = last(records.filter(({ action }) => "updated" !== action));

              // if last action was added - the document may changed, so we need to update it
              shouldUpdate = lastRecord.action === "added";
            }

            // if there were added and we should re-fetch
            // or there weren't added but there were updates
            if (shouldUpdate || updated > 0) {
              // we have to update item.
              action = "updated";
              break;
            }

            // otherwise do nothing, return empty record to be ignored
            console.log("skipping status change for", { item });

            // eslint-disable-next-line array-callback-return
            return;
          }
        }

        const record = { item, action };

        console.log("picked status for", record);
        return record;
      })
    );
  }

  /** @private */
  async _loadPostPictures(documentOrFeed: any) {
    if (isArray(documentOrFeed)) {
      return batch(documentOrFeed, ceramicBatchSize, async document => this._loadPostPictures(document));
    }

    const document = documentOrFeed;
    let { picture } = document;

    if (isValidCID(picture)) {
      picture = await this.IPFS.load(picture);
    }
    return {
      ...document,
      picture
    };
  }
}

export default function createCeramicFeed(ceramicNodeUrl, ceramicIndex, ceramicLiveIndex): CeramicFeed {
  return new CeramicFeed(ceramicNodeUrl, ceramicIndex, ceramicLiveIndex);
}
