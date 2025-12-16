// lib/cache.ts
// For serverless environments, we'll use a simple TTL-based in-memory cache
// This gets reset on cold starts, but helps with warm requests
const cache = new Map<string, { value: any; expires: number }>();

export function setCache(key: string, value: any, ttl: number = 300000) { // Default 5 minutes
  const expires = Date.now() + ttl;
  cache.set(key, { value, expires });
}

export function getCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }

  return cached.value as T;
}

export function clearCache() {
  cache.clear();
}

// Export the cache instance for direct access if needed
export { cache };