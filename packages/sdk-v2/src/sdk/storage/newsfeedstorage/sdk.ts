import { batch, createNewsFeedDb, isValidHistoryId } from "../../newsfeed/utils";
import { createCeramicFeed, CeramicFeed, FeedPost } from "../../newsfeed";

const devConfig = {
  devCeramicNodeURL: "https://ceramic-clay.3boxlabs.com",
  ceramicIndex: "k2t6wyfsu4pg10xd3qcu4lfbgk6u2r1uwdyggfchpk77hxormr4wvqkitqvkce",
  ceramicLiveIndex: "k2t6wyfsu4pg26i4h73gc5kdjis5rtfxg62wd93su31ldxfeacl6rx5cs1nix5"
};

class NewsFeedStorage {
  db: any;
  // storage: typeof AsyncStorage;
  Feed: CeramicFeed;

  constructor() {
    // todo: add envs, hardcoded qa for testing purposes
    const { devCeramicNodeURL, ceramicIndex, ceramicLiveIndex } = devConfig;
    this.db = createNewsFeedDb();
    this.Feed = createCeramicFeed(devCeramicNodeURL, ceramicIndex, ceramicLiveIndex);
    const { db } = this;

    db.open()
      .then(async () => {
        const historyId = await db.historyCache.toCollection().first();
        const posts = await db.posts.toCollection().first();

        if (!historyId || !isValidHistoryId(historyId.id) || !posts) {
          //todo-fix: blob urls stored are not loading images in a new session
          await this._loadRemoteFeed(!historyId);
        } else {
          await this._syncFromRemote(historyId.id);
        }

        db.close();
      })
      .catch(error => {
        console.log("db action failed while it was open", { error });
      });
  }

  async _syncFromRemote(historyCacheId) {
    const { Feed } = this;

    console.log("ceramic sync from remote started");

    try {
      const lastHistoryId = historyCacheId;

      // get last history id
      console.log("fetched last history id", { lastHistoryId });

      // fetching & aggregating (only if had last history id) history
      const { history, historyId } = await Feed.getHistory();
      const changeLog = this._fetchChangeLog(history, lastHistoryId);
      const changeLogAvailable = false !== changeLog;

      // if history id from ceramic is empty that means history is empty - e.g. no posts, skipping process
      if (!historyId) {
        console.info("empty history or no posts published, ceramic sync from remote skipped");
        return;
      }

      // if we have changelog (there was last history id stored, it was correct and existing in ceramic)
      if (changeLogAvailable) {
        // applying it
        await this._applyChangeLog(changeLog);
      } else {
        // otherwise performing full reload
        await this._loadRemoteFeed();
      }

      console.log("ceramic sync from remote done");
    } catch (exception: any) {
      console.log("ceramic sync from remote failed", exception.message, exception);
    }
  }

  /** @private */
  async _loadRemoteFeed(isNew = false) {
    const { db, Feed } = this;
    if (!isNew) {
      try {
        await db.posts.clear();
        await db.historyCacheId.clear();
      } catch (error) {
        console.log("clearing of existing newsfeed db failed", { error });
      }
    }

    const ceramicPosts = await Feed.getPosts();
    const { historyId } = await Feed.getHistory();

    await db.historyCache.add({ id: historyId });
    await db.posts.bulkAdd(ceramicPosts);

    console.log("added to db");
  }

  /** @private */
  _fetchChangeLog(history, lastHistoryId = null) {
    // skip on full reload (if last history is empty)
    if (lastHistoryId) {
      try {
        return this.Feed.aggregateHistory(history, lastHistoryId);
      } catch (exception: any) {
        // if history id not found or history broken - fallback to false, otherwise rethrow
        if ("HISTORY_NOT_FOUND" !== exception.name) {
          throw exception;
        }
      }
    }

    return false;
  }

  /** @private */
  async _applyChangeLog(changeLog) {
    const ceramicBatchSize = 5;
    const { db } = this;

    console.log("Ceramic history", { changeLog });

    await batch(changeLog, ceramicBatchSize, async ({ item: postId, action }) => {
      switch (action) {
        case "added":
        case "updated": {
          await this._mergePost(postId, action);
          break;
        }
        case "removed": {
          console.log("removing ceramic feed item", { postId, action });
          await db.posts.delete(postId);
          break;
        }
        default: {
          console.warn("invalid ceramic feed item action received", { postId, action });
        }
      }
    });
  }

  /** @private */
  async _mergePost(postId, action) {
    const { db, Feed } = this;
    let post: FeedPost | null = null;

    try {
      console.log("fetching ceramic feed item", { postId, action });
      post = await Feed.getPost(postId); // trying to load post from Ceramic Network
    } catch (exception: any) {
      // rethrow any network/unexpected error
      if ("DOCUMENT_NOT_FOUND" !== exception.name) {
        throw exception;
      }

      // otherwise (if document not found or broken) just skip it and continue process
      console.warn("imported ceramic feed item not exists", exception.message, exception, { postId, action });
    }

    // if we got ceramic document - merging with the current feed
    if (post) {
      switch (action) {
        case "updated": {
          db.posts.update(post.id, { post });
          break;
        }
        case "added": {
          db.posts.add(post);
        }
      }
    }
  }
}

export const createNewsFeedStorage = () => {
  return new NewsFeedStorage();
};
