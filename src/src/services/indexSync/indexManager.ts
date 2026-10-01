import staticIndexData from "../../../assets/models/index_mangas.json";
import { IndexData } from "../mangaClassifier/classifyCore";
import { getLocalVersion, updateLocalIndex, getCachedIndex } from "./indexStorage"; 

const API_BASE_URL = "http://localhost:8000";

let memoryIndex: IndexData | null = null;

export async function syncIndexWithServer(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/index/version`);
    if (!res.ok) return;

    const { version: serverVersion } = await res.json();
    if (typeof serverVersion !== "number") return;

    const localVersion = await getLocalVersion();

    if (serverVersion > localVersion) {
      const newIndex = await updateLocalIndex(
        serverVersion,
        `${API_BASE_URL}/api/index/download`
      );
      
      if (newIndex) {
        memoryIndex = newIndex;
      }
    }
  } catch {
    // error
  }
}

export async function getActiveIndex(): Promise<IndexData> {
  if (memoryIndex) {
    return memoryIndex;
  }

  const cachedIndex = await getCachedIndex();
  if (cachedIndex) {
    memoryIndex = cachedIndex;
    return memoryIndex;
  }

  return staticIndexData as IndexData;
}
