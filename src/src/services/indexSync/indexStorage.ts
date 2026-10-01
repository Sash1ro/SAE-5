import * as FileSystem from "expo-file-system/legacy";
import { IndexData } from "../mangaClassifier/classifyCore";
import { isValidIndex } from "@/utils/utils";

const versionFile = `${FileSystem.documentDirectory}version.json`;
const indexFile = `${FileSystem.documentDirectory}index_mangas.json`;

export async function getLocalVersion(): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(versionFile);
    if (!info.exists) return 0;
    const content = await FileSystem.readAsStringAsync(versionFile);
    return JSON.parse(content).version || 0;
  } catch {
    return 0;
  }
}

export async function updateLocalIndex(version: number, url: string): Promise<IndexData | null> {
  try {
    const downloadRes = await FileSystem.downloadAsync(url, indexFile);
    if (downloadRes.status !== 200) return null;

    await FileSystem.writeAsStringAsync(versionFile, JSON.stringify({ version }));
    const content = await FileSystem.readAsStringAsync(indexFile);
    const data = JSON.parse(content);

    return isValidIndex(data) ? data : null;
  } catch {
    return null;
  }
}

export async function getCachedIndex(): Promise<IndexData | null> {
  try {
    const info = await FileSystem.getInfoAsync(indexFile);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(indexFile);
    const data = JSON.parse(content);

    return isValidIndex(data) ? data : null;
  } catch {
    return null;
  }
}
