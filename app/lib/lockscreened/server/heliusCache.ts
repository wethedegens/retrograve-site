// app/lib/lockscreened/server/heliusCache.ts
//
// Small in-memory cache for serverless instances. This does not replace durable
// rate limiting, but it suppresses duplicate Helius calls within warm runtimes.

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const globalForHelius = globalThis as typeof globalThis & {
  __lockscreenedHeliusCache?: Map<string, CacheEntry<unknown>>;
};

const cache =
  globalForHelius.__lockscreenedHeliusCache ||
  new Map<string, CacheEntry<unknown>>();

if (!globalForHelius.__lockscreenedHeliusCache) {
  globalForHelius.__lockscreenedHeliusCache = cache;
}

export async function withHeliusCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value = await loader();
  cache.set(key, {
    value,
    expiresAt: now + Math.max(1000, ttlMs),
  });

  if (cache.size > 250) {
    for (const [entryKey, entry] of cache.entries()) {
      if (entry.expiresAt <= now) cache.delete(entryKey);
    }

    while (cache.size > 200) {
      const firstKey = cache.keys().next().value;
      if (!firstKey) break;
      cache.delete(firstKey);
    }
  }

  return value;
}
