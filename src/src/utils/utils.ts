import { IndexData } from "@/services/mangaClassifier/classifyCore";
import { Linking } from "react-native";

export const SERVER_URL = "https://sae.sash1ro.fr/api"

export function isValidIndex(data: any): data is IndexData {
  return !!data && Array.isArray(data.labels) && Array.isArray(data.embeddings);
}

export function formatToStub(str: string): string {
  return str.trim().toLocaleLowerCase().replaceAll(" ", "");
}

export const openLink = (url: string) => {
  Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};