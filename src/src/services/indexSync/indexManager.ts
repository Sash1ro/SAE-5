import staticIndexData from "../../../assets/models/index_mangas.json";
import { IndexData } from "../mangaClassifier/classifyCore";
import { getLocalVersion, updateLocalIndex, getCachedIndex } from "./indexStorage"; 
import { SERVER_URL } from "@/stores/configStore";

let memoryIndex: IndexData | null = null;

export async function syncIndexWithServer(): Promise<void> {
  try {
    const res = await fetch(`${SERVER_URL}/index/version`);
    if (!res.ok) return;

    const { version: serverVersion } = await res.json();
    if (typeof serverVersion !== "number") return;

    const localVersion = await getLocalVersion();

    if (serverVersion > localVersion) {
      const newIndex = await updateLocalIndex(
        serverVersion,
        `${SERVER_URL}/index/download`
      );
      
      if (newIndex) {
        memoryIndex = newIndex;
      }
    }
  } catch (e) {
    //silent error
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
