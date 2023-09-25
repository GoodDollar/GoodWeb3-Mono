import { first, isFunction, noop } from "lodash";

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
