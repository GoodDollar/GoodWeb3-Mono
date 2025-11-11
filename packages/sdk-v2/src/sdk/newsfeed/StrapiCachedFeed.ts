import { createNewsFeedDb } from "./utils";
import { AsyncStorage } from "../storage";
import { IpfsStorage } from "../ipfs/sdk";
import { batch } from "../../utils";
import { EnvKey } from "../base";

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

interface StrapiPost {
  id: number | string;
  title?: string;
  link?: string;
  content?: string;
  picture?: any;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  sponsored?: {
    link?: string | null;
    logo?: string | null;
  } | null;
  sponsored_link?: string | null;
  sponsored_logo?: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  nextPage?: number | null;
}

interface StrapiResponse {
  data?: StrapiPost[];
  meta?: {
    pagination?: Pagination;
  };
}

interface NewsFeedOptions {
  baseUrl: string;
  env: EnvKey;
  pageSize?: number;
}

export class StrapiCachedFeed {
  IPFS_BATCH = 10;
  SYNC_PERIOD = 1000 * 60 * 60; //1 hour
  PAGE_SIZE = 10;
  filter: FeedFilter = {};
  db: any;
  IPFS: any;
  ready: Promise<void>;
  baseUrl: string;
  pageSize: number;

  constructor(
    filter: FeedFilter = {},
    ipfs: IpfsStorage,
    options: NewsFeedOptions = { env: "production", baseUrl: "" }
  ) {
    this.db = createNewsFeedDb();
    this.ready = this.db.open();
    this.filter = filter || {};
    this.IPFS = ipfs;
    this.pageSize = options.pageSize ?? this.PAGE_SIZE;
    this.baseUrl = options.baseUrl;

    if (!this.baseUrl) {
      throw new Error(`StrapiCachedFeed: news feed endpoint is not configured for ${options.env} environment`);
    }
  }

  periodicSync = async (callback?: () => void) => {
    await this.ready;
    const lastUpdate = new Date((await AsyncStorage.getItem("StrapiCachedFeed")) || 0);

    if (lastUpdate > new Date(Date.now() - this.SYNC_PERIOD)) {
      console.log("StrapiCachedFeed: wait 1 hour before next update");
    } else {
      console.log("StrapiCachedFeed: periodic sync");
      await this.syncPosts();
      callback && callback();
    }

    setTimeout(() => this.periodicSync(callback), this.SYNC_PERIOD);
  };
  /**
   * fetch posts from strapi.
   * only the first pageSize posts will be updated if they are modified.
   * to modify older posts the database cache needs to be reset
   *  */
  syncPosts = async (page = 1) => {
    const lastUpdate = new Date((await AsyncStorage.getItem("StrapiCachedFeed")) || 0);
    await this.ready;
    const { posts, pagination } = await this._fetchStrapiPosts(page);

    // only refetch images and put in db updated posts
    const validPosts = posts.filter(post => new Date(post.updated || post.published) > lastUpdate);

    const postsWithPictures = await this._loadPostPictures(validPosts);
    Array.isArray(postsWithPictures) &&
      postsWithPictures.length > 0 &&
      (await this.db.posts.bulkPut(postsWithPictures));

    // remove posts that no longer exists in the top pageSize
    if (page === 1) {
      const cachedPosts = await this.db.posts.orderBy("published").reverse().offset(0).limit(this.pageSize).toArray();
      const existing = cachedPosts.map(_ => _.id);
      const incoming = posts.map(_ => _.id);
      const missing = existing.filter(_ => incoming.includes(_) === false);

      missing.length > 0 && (await this.db.posts.bulkDelete(missing));
    }

    //check if we need to fetch more, if all posts are newer we need to fetch next page
    const hasOlder = posts.find(post => new Date(post.updated || post.published) < lastUpdate);

    if (this._shouldFetchMore(pagination, Boolean(hasOlder), posts.length > 0)) {
      return this.syncPosts(page + 1);
    } else {
      return AsyncStorage.setItem("StrapiCachedFeed", Date.now());
    }
  };

  /** @private */
  async _loadPostPictures(documentOrFeed: FeedPost | FeedPost[]): Promise<FeedPost | FeedPost[]> {
    if (Array.isArray(documentOrFeed)) {
      return batch(documentOrFeed, this.PAGE_SIZE, async document => this._loadPostPictures(document));
    }

    const document = documentOrFeed;
    let { picture } = document;

    if (!picture || picture.startsWith("data:")) {
      return {
        ...document,
        picture
      };
    }

    try {
      picture = await this._fetchPictureAsDataUrl(picture);
    } catch (error) {
      console.warn("StrapiCachedFeed: failed to hydrate picture", error);
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

  private async _fetchStrapiPosts(page: number): Promise<{ posts: FeedPost[]; pagination?: Pagination }> {
    const params = new URLSearchParams();

    if (this.filter?.tag) {
      params.append("tag", this.filter.tag);
    }

    if (this.filter?.context) {
      params.append("context", this.filter.context);
    }

    params.append("page", String(page));
    params.append("pageSize", String(this.pageSize));

    const queryString = params.toString();
    const separator = this.baseUrl?.includes("?") ? "&" : "?";
    const requestUrl = queryString ? `${this.baseUrl}${separator}${queryString}` : this.baseUrl;

    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`Strapi: failed to fetch news feed (${response.status})`);
    }

    const { data, meta } = (await response.json()) as StrapiResponse;

    return {
      posts: (data ?? []).map(this._mapStrapiPost),
      pagination: meta?.pagination
    };
  }

  private _mapStrapiPost = (post: StrapiPost): FeedPost => {
    const published = post.publishedAt || post.createdAt || post.updatedAt || new Date().toISOString();
    const updated = post.updatedAt || post.publishedAt || post.createdAt || "";

    return {
      id: String(post.id),
      content: post.content ?? "",
      title: post.title ?? "",
      link: post.link ?? "",
      picture: post.picture ? post.picture.url : "",
      published,
      updated,
      sponsored_link: post.sponsored_link ?? post.sponsored?.link ?? "",
      sponsored_logo: post.sponsored_logo ?? post.sponsored?.logo ?? ""
    };
  };

  private _shouldFetchMore(pagination?: Pagination, hasOlder?: boolean, hasPosts?: boolean) {
    if (hasOlder || !hasPosts || !pagination) {
      return false;
    }

    if (pagination.nextPage !== undefined && pagination.nextPage !== null) {
      return pagination.nextPage > pagination.page;
    }

    return pagination.page < pagination.pageCount;
  }

  private async _fetchPictureAsDataUrl(url: string) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch picture (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const mime = response.headers.get("content-type") ?? "application/octet-stream";
      const base64 = this._arrayBufferToBase64(arrayBuffer);

      return base64 ? `data:${mime};base64,${base64}` : url;
    } catch (error) {
      console.warn("StrapiCachedFeed: failed fetching remote picture", error);
      return url;
    }
  }

  private _arrayBufferToBase64(buffer: ArrayBuffer) {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(buffer).toString("base64");
    }
  }
}
