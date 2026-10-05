import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_TTL = 1000 * 60 * 60 * 24;

export async function getCache<T>(key: string): Promise<{ found: boolean; data: T | null }> {
  try {
    const cachedString = await AsyncStorage.getItem(key);
    if (!cachedString) return { found: false, data: null };

    const cachedData = JSON.parse(cachedString);
    const ttl = cachedData.ttl || DEFAULT_TTL;
    const isExpired = Date.now() - cachedData.timestamp > ttl;

    if (isExpired) {
      await AsyncStorage.removeItem(key);
      return { found: false, data: null };
    }

    return { found: true, data: cachedData.data as T };
  } catch (error) {
    return { found: false, data: null };
  }
}

export async function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
  try {
    const validTtl = typeof ttl === 'number' && !isNaN(ttl) ? ttl : DEFAULT_TTL;
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ data, timestamp: Date.now(), ttl: validTtl })
    );
  } catch (error) {
    // silent error
  }
}
