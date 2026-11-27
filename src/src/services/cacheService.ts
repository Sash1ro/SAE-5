import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_TTL = 1000 * 60 * 60 * 6;
const CACHE_KEY_PREFIX = "@cache:";

function toCacheKey(key: string): string {
  return key.startsWith(CACHE_KEY_PREFIX) ? key : `${CACHE_KEY_PREFIX}${key}`;
}

export async function getCache<T>(
  key: string,
): Promise<{ found: boolean; data: T | null }> {
  const storageKey = toCacheKey(key);
  try {
    const cachedString = await AsyncStorage.getItem(storageKey);
    if (!cachedString) return { found: false, data: null };

    const cachedData = JSON.parse(cachedString);
    const ttl = cachedData.ttl || DEFAULT_TTL;
    const isExpired = Date.now() - cachedData.timestamp > ttl;

    if (isExpired) {
      await AsyncStorage.removeItem(storageKey);
      return { found: false, data: null };
    }

    return { found: true, data: cachedData.data as T };
  } catch {
    return { found: false, data: null };
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL,
): Promise<void> {
  try {
    const validTtl = typeof ttl === "number" && !isNaN(ttl) ? ttl : DEFAULT_TTL;
    await AsyncStorage.setItem(
      toCacheKey(key),
      JSON.stringify({ data, timestamp: Date.now(), ttl: validTtl }),
    );
  } catch {
    // silent error
  }
}

export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // silent error
  }
}

export async function clearCacheByPrefix(prefix: string): Promise<void> {
  try {
    const fullPrefix = toCacheKey(prefix);
    const keys = await AsyncStorage.getAllKeys();
    const matchingKeys = keys.filter((k) => k.startsWith(fullPrefix));
    if (matchingKeys.length > 0) {
      await AsyncStorage.multiRemove(matchingKeys);
    }
  } catch {
    // silent error
  }
}

export async function pruneExpiredCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
    if (cacheKeys.length === 0) return;

    const entries = await AsyncStorage.multiGet(cacheKeys);
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, raw] of entries) {
      if (!raw) {
        expiredKeys.push(key);
        continue;
      }
      try {
        const parsed = JSON.parse(raw);
        const ttl = parsed.ttl || DEFAULT_TTL;
        if (!parsed.timestamp || now - parsed.timestamp > ttl) {
          expiredKeys.push(key);
        }
      } catch {
        expiredKeys.push(key);
      }
    }

    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys);
    }
  } catch {
    // silent error
  }
}
