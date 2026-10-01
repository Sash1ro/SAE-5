import { IndexData } from "../mangaClassifier/classifyCore";
import { isValidIndex } from "@/utils/utils";

const CACHE_NAME = "manganitor-cache";
const VERSION_KEY = "manga_index_version";
const INDEX_PATH = "/index_mangas.json";

export async function getLocalVersion(): Promise<number> {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(VERSION_KEY);
  return val ? parseInt(val, 10) : 0;
}

export async function updateLocalIndex(version: number, url: string): Promise<IndexData | null> {
  if (typeof window === "undefined") return null;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!isValidIndex(data)) return null;

    if ("caches" in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        INDEX_PATH,
        new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        })
      );
    }
    localStorage.setItem(VERSION_KEY, version.toString());
    
    return data;
  } catch {
    return null;
  }
}

export async function getCachedIndex(): Promise<IndexData | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedRes = await cache.match(INDEX_PATH);
    if (!cachedRes) return null;

    const data = await cachedRes.json();
    return isValidIndex(data) ? data : null;
  } catch {
    return null;
  }
}
