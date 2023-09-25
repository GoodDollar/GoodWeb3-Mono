import { isArray } from "lodash";
import { CID } from "multiformats/cid";

import { CeramicModel as Post } from "./client";
import { batch, isValidCID, serializeCollection, serializeDocument } from "./utils";
import createIpfsStorage from "../ipfs/sdk";

// move configs to constructor
const ceramicBatchSize = 5;

export interface FeedItems {
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
  document: FeedItems[];
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

    console.log("get ceramic post", { serialized });
    return this._loadPostPictures(serialized);
  }

  async getPosts(): Promise<DocumentOrFeed> {
    const feedPosts = await this.Post.all();
    const serialized = serializeCollection(feedPosts);

    console.log("get ceramic posts collection", { serialized, feedPosts });
    return this._loadPostPictures(serialized);
  }

  // async getHistory() {
  //   const { content } = await Post.getLiveIndex();
  //   const history = get(content, "items", []);
  //   const historyId = get(last(history), "id", null);

  //   return { history, historyId };
  // }

  // aggregateHistory(history, afterHistoryId = null) {
  //   const historyIds = map(history, "id");
  //   const historyId = last(historyIds);
  //   let lastChanges = history;

  //   log.debug("get history", { historyId, historyIds, afterHistoryId });

  //   if (afterHistoryId) {
  //     const afterIndex = history.findIndex(({ id }) => id === afterHistoryId);

  //     if (afterIndex < 0) {
  //       const exception = new Error(`Couldn't find history id '${afterHistoryId}'`);

  //       assign(exception, {
  //         historyId: afterHistoryId,
  //         name: "HISTORY_NOT_FOUND"
  //       });

  //       throw exception;
  //     }

  //     lastChanges = history.slice(afterIndex + 1);
  //   }

  //   const aggregated = groupBy(lastChanges, "item");

  //   log.debug("Got last changes:", { lastChanges });
  //   log.debug("Got aggregated changes:", { aggregated });

  //   return filter(
  //     keys(aggregated).map(item => {
  //       let action;
  //       const records = aggregated[item];

  //       // read history of specific document, aggredate by the event count
  //       const { added = 0, removed = 0, updated = 0 } = countBy(records, "action");

  //       log.debug("picking status for", { item, records, added, removed, updated });

  //       switch (Math.sign(added - removed)) {
  //         case -1:
  //           // if removed actions > added actions - remove item
  //           action = "removed";
  //           break;
  //         case 1:
  //           // if removed actions < added actions - add item
  //           action = "added";
  //           break;
  //         default: {
  //           // if removed equal added OR both removed/added were 0
  //           let shouldUpdate = false;

  //           if (added > 0) {
  //             // if there were 'added' and 'removed' - picking them
  //             const lastRecord = last(records.filter(({ action }) => "updated" !== action));

  //             // if last action was added - the document may changed, so we need to update it
  //             shouldUpdate = lastRecord.action === "added";
  //           }

  //           // if there were added and we should re-fetch
  //           // or there weren't added but there were updates
  //           if (shouldUpdate || updated > 0) {
  //             // we have to update item.
  //             action = "updated";
  //             break;
  //           }

  //           // otherwise do nothing, return empty record to be ignored
  //           log.debug("skipping status change for", { item });

  //           // eslint-disable-next-line array-callback-return
  //           return;
  //         }
  //       }

  //       const record = { item, action };

  //       log.debug("picked status for", record);
  //       return record;
  //     })
  //   );
  // }

  //   [
  //     "link",
  //     "title",
  //     "content",
  //     "picture",
  //     "published",
  //     "sponsored_link",
  //     "sponsored_logo",
  //     "id"
  // ]
  /** @private */
  async _loadPostPictures(documentOrFeed: any) {
    console.log("load post picture", { documentOrFeed });

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
