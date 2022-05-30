export {}
/**
 * Clear cache with delay.
 * @param {MemoizedFunction} memoize Memoize function.
 * @param {number} delay Delay of cache clear.
 * @returns {void}
 */
export function delayedCacheClear(memoize: any, delay = 1000): void {
  console.log('delayed cache memoize object (SDK_MONO) -->', memoize.cache)
  setTimeout(() => memoize.cache.clear(), delay)
}

/**
 * Clear cache.
 * @param {MemoizedFunction} memoize Memoize function.
 * @returns {void}
 */
export function cacheClear(memoize: any): void {
  console.log('cache memoize object(SDK_MONO) -->', memoize.cache)
  memoize.cache.clear?.call()
}

