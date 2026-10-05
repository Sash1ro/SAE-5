import { Platform } from "react-native";
import { SERVER_URL } from "@/stores/configStore";

export interface ContributionPayload {
  universe: string;
  tome: string;
  image: string;
}

export async function uploadMangaContribution(
  payload: ContributionPayload,
): Promise<boolean> {
  const formData = new FormData();
  formData.append("universe", payload.universe.trim());
  formData.append("tome", payload.tome.trim());

  if (Platform.OS === "web") {
    const res = await fetch(payload.image);
    const blob = await res.blob();
    formData.append("image", blob, "cover.jpg");
  } else {
    formData.append("image", {
      uri: payload.image,
      name: "cover.jpg",
      type: "image/jpeg",
    } as any);
  }

  const response = await fetch(`${SERVER_URL}/api/contributions`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Error while sending contributions.");
  }

  return true;
}
