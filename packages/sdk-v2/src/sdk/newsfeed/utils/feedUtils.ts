import { chunk, isString } from "lodash";

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
