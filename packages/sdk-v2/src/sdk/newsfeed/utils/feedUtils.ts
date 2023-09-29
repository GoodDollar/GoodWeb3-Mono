import { chunk, isString } from "lodash";

const hexadecimalRe = /^[0-9a-f]+$/i;

export const serializeDocument = (document: any) => {
  const { id, content } = document;

  return {
    ...content,
    id: String(id)
  };
};

export const createFeedWithPictures = (feedPosts: any[]) => {
  return feedPosts.map((post: any) => {
    const { picture } = post;
    if (picture) {
      const blobUrl = URL.createObjectURL(picture);
      post.picture = blobUrl;
    }
    return { ...post };
  });
};

export const serializeCollection = (documents: any[]) => {
  return documents.map(serializeDocument);
};

export const batch = async <T, R>(items: T[], chunkSize: number, onItem: any) =>
  chunk(items, chunkSize).reduce(
    async (promise, itemsChunk) =>
      promise.then(async results => {
        const chunkResults: R[] = await Promise.all(itemsChunk.map(onItem));

        return results.concat(chunkResults);
      }),
    Promise.resolve([] as R[])
  );

//todo: move to utils
export const cidRegexp = /^[\w\d]+$/i;

// checks is string a valid CID. it should be at least 40 chars length and contrain only letters & numbers
export const isValidCID = source => isString(source) && source.length >= 40 && cidRegexp.test(source);

export const isValidHistoryId = id => isString(id) && id.length === 40 && hexadecimalRe.test(id);
