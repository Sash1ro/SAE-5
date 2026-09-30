import { Platform } from "react-native";
import staticIndexData from "../../assets/models/index_mangas.json";
import { IndexData } from "./mangaClassifier/classifyCore";

const API_BASE_URL = "http://localhost:8000";

let memoryIndex: IndexData | null = null;

export async function syncIndexWithServer(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/index/version`);
    if (!res.ok) return;

    const { version: serverVersion } = await res.json();
    if (typeof serverVersion !== "number") return;

    if (Platform.OS === "web") {
      const localVersionStr =
        typeof window !== "undefined"
          ? localStorage.getItem("manga_index_version")
          : null;
      const localVersion = localVersionStr ? parseInt(localVersionStr, 10) : 0;

      if (serverVersion > localVersion) {
        const downloadRes = await fetch(`${API_BASE_URL}/api/index/download`);
        if (!downloadRes.ok) return;

        const data = await downloadRes.json();
        if (
          data &&
          Array.isArray(data.labels) &&
          Array.isArray(data.embeddings)
        ) {
          memoryIndex = data as IndexData;
          if (typeof window !== "undefined" && "caches" in window) {
            const cache = await caches.open("manganitor-cache");
            await cache.put(
              "/index_mangas.json",
              new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" },
              }),
            );
          }
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "manga_index_version",
              serverVersion.toString(),
            );
          }
        }
      }
    } else {
      const FileSystem = require("expo-file-system/legacy");
      const versionFile = `${FileSystem.documentDirectory}version.json`;
      const indexFile = `${FileSystem.documentDirectory}index_mangas.json`;

      let localVersion = 0;
      const versionInfo = await FileSystem.getInfoAsync(versionFile);
      if (versionInfo.exists) {
        try {
          const versionContent =
            await FileSystem.readAsStringAsync(versionFile);
          const parsed = JSON.parse(versionContent);
          localVersion = parsed.version || 0;
        } catch {}
      }

      if (serverVersion > localVersion) {
        const downloadRes = await FileSystem.downloadAsync(
          `${API_BASE_URL}/api/index/download`,
          indexFile,
        );
        if (downloadRes.status === 200) {
          await FileSystem.writeAsStringAsync(
            versionFile,
            JSON.stringify({ version: serverVersion }),
          );
          const fileContent = await FileSystem.readAsStringAsync(indexFile);
          const data = JSON.parse(fileContent);
          if (
            data &&
            Array.isArray(data.labels) &&
            Array.isArray(data.embeddings)
          ) {
            memoryIndex = data as IndexData;
          }
        }
      }
    }
  } catch {}
}

export async function getActiveIndex(): Promise<IndexData> {
  if (memoryIndex) {
    return memoryIndex;
  }

  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined" && "caches" in window) {
        const cache = await caches.open("manganitor-cache");
        const cachedRes = await cache.match("/index_mangas.json");
        if (cachedRes) {
          const data = await cachedRes.json();
          if (
            data &&
            Array.isArray(data.labels) &&
            Array.isArray(data.embeddings)
          ) {
            memoryIndex = data as IndexData;
            return memoryIndex;
          }
        }
      }
    } catch {}
  } else {
    try {
      const FileSystem = require("expo-file-system/legacy");
      const indexFile = `${FileSystem.documentDirectory}index_mangas.json`;
      const info = await FileSystem.getInfoAsync(indexFile);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(indexFile);
        const data = JSON.parse(content);
        if (
          data &&
          Array.isArray(data.labels) &&
          Array.isArray(data.embeddings)
        ) {
          memoryIndex = data as IndexData;
          return memoryIndex;
        }
      }
    } catch {}
  }

  return staticIndexData as IndexData;
}
