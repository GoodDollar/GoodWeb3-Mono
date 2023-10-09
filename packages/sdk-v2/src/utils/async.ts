import { chunk, first, isFunction, noop } from "lodash";

const defaultOnFallback = error => {
  console.warn("async fallback Error -->", { error });
  return true;
};

export const fallback = async (asyncFns, onFallback = defaultOnFallback) => {
  if (asyncFns.length < 2) {
    // if no function passed - return undefined
    // if one function passed - immediately return its value
    // because reducer will return fn itself without invocation
    // passiing Promise.resolve as initial accumulator won't help
    // as we're reducing fns only in .catch
    return first(asyncFns) || noop;
  }

  return asyncFns.reduce(async (current, next) => {
    let promise = current;

    if (isFunction(current)) {
      promise = current();
    }

    // eslint-disable-next-line require-await
    return promise.catch(async error => {
      if (!onFallback(error)) {
        throw error;
      }

      return next();
    });
  });
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
