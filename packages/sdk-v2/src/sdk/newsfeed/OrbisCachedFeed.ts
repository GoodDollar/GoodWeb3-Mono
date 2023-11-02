import { Orbis } from "@orbisclub/orbis-sdk";
import { isArray } from "lodash";

import { createNewsFeedDb } from "./utils";
import { AsyncStorage } from "../storage";
import { IpfsStorage, isValidCID } from "../ipfs/sdk";
import { batch } from "../../utils";

export type FeedFilter = { context?: string; tag?: string };

export interface FeedPost {
  id: string;
  link: string;
  title: string;
  content: string;
  picture: string;
  published: string;
  updated: string;
  sponsored_link: string;
  sponsored_logo: string;
}

export class OrbisCachedFeed {
  IPFS_BATCH = 10;
  SYNC_PERIOD = 1000 * 60 * 60; //1 hour
  sdk: Orbis = null;
  filter: FeedFilter = {};
  db: any;
  IPFS: any;
  ready: Promise<void>;

  constructor(filter: FeedFilter, ipfs: IpfsStorage) {
    this.db = createNewsFeedDb();
    this.ready = this.db.open();
    this.filter = filter;
    this.sdk = new Orbis();
    this.IPFS = ipfs;
  }

  periodicSync = async (callback?: () => void) => {
    await this.ready;
    const lastUpdate = new Date((await AsyncStorage.getItem("OrbisCachedFeed")) || 0);

    if (lastUpdate > new Date(Date.now() - this.SYNC_PERIOD)) {
      console.log("OrbisCachedFeed: wait 1 hour before next update");
    } else {
      console.log("OrbisCachedFeed: periodic sync");
      await this.syncPosts();
      callback && callback();
    }

    setTimeout(() => this.periodicSync(), this.SYNC_PERIOD);
  };
  /**
   * fetch posts from orbis.
   * only the first 50 (orbis first page size) posts will be updated if they are modified.
   * to modify older posts the database cache needs to be reset
   *  */
  syncPosts = async (page = 0) => {
    const lastUpdate = new Date((await AsyncStorage.getItem("OrbisCachedFeed")) || 0);
    await this.ready;
    const { data: posts } = await this.sdk.getPosts(this.filter, page);

    //get the relevant fields from orbis post
    const postsWithId = posts?.map(post => ({
      id: post.stream_id,
      content: post.content.body,
      title: post.content.title,
      ...post.content.data
    }));

    // only refetch images and put in db updated posts
    const validPosts = postsWithId.filter(post => new Date(post.updated || post.published) > lastUpdate);

    const postsWithPictures = await this._loadPostPictures(validPosts);
    postsWithPictures.length > 0 && (await this.db.posts.bulkPut(postsWithPictures));

    // remove posts that no longer exists in the top 50
    if (page === 0) {
      const cachedPosts = await this.db.posts.orderBy("published").reverse().offset(0).limit(50).toArray();
      const existing = cachedPosts.map(_ => _.id);
      const incoming = postsWithId.map(_ => _.id);
      const missing = existing.filter(_ => incoming.includes(_) === false);
      const deleted = (
        await Promise.all(missing.map(_ => this.sdk.getPost(_).then(postResult => [_, !!postResult.data])))
      )
        .filter(_ => !_[1])
        .map(_ => _[0]);

      deleted.length > 0 && (await this.db.posts.bulkDelete(deleted));
    }

    //check if we need to fetch more, if all posts are newer we need to fetch next page
    const hasOlder = postsWithId.find(post => new Date(post.updated || post.published) < lastUpdate);

    if (!hasOlder && posts.length > 0) {
      return this.syncPosts(page + 1);
    } else {
      return AsyncStorage.setItem("OrbisCachedFeed", Date.now());
    }
  };

  /** @private */
  async _loadPostPictures(documentOrFeed: any) {
    if (isArray(documentOrFeed)) {
      return batch(documentOrFeed, this.IPFS_BATCH, async document => this._loadPostPictures(document));
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

  async getPosts(offset = 0, limit = 10): Promise<Array<FeedPost>> {
    await this.ready;
    const posts = await this.db.posts.orderBy("published").reverse().offset(offset).limit(limit).toArray();
    return posts as Array<FeedPost>;
  }
}
