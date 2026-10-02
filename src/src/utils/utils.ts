import { IndexData } from "@/services/mangaClassifier/classifyCore";

export function isValidIndex(data: any): data is IndexData {
  return !!data && Array.isArray(data.labels) && Array.isArray(data.embeddings);
}

export function formatToStub(str: string) : string {
  return str.trim().toLocaleLowerCase().replaceAll(" ", "");
}