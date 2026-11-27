import { apiClient } from "@/services/apiService";
import { processImageToForm } from "@/utils/processImage";
import { AxiosResponse } from "axios";
import { Box, History, RESULT, TYPE } from "@/types";

export type { Box, History };
export { RESULT, TYPE };

export const getHistory = async (id: string): Promise<AxiosResponse> => {
  return await apiClient.get<History>(`/user/history/${id}`);
};

export const getAllHisotry = async (): Promise<AxiosResponse> => {
  return await apiClient.get<History[]>("/user/history");
};

const processToForm = async (
  universe: string,
  volume: number,
  imageUri: string,
  confidence: number,
  similarity: number,
  result: string,
  type: string,
  box?: Box | null,
): Promise<FormData> => {
  let formData = new FormData();
  formData.append("universe_name", universe.trim());
  formData.append("universe_volume", volume.toString());
  formData.append("ia_confidence", confidence.toString());
  formData.append("ia_similarity", similarity.toString());
  formData.append("history_result", result.trim());
  formData.append("history_type", type.trim());
  if (box) {
    formData.append("box_x1", box.x1.toString());
    formData.append("box_y1", box.y1.toString());
    formData.append("box_x2", box.x2.toString());
    formData.append("box_y2", box.y2.toString());
  }
  return await processImageToForm(formData, imageUri);
};

export const addToHistory = async (
  name: string,
  volume: number,
  imageUri: string,
  confidence: number,
  similarity: number,
  result: string,
  type: string,
  box?: Box | null,
): Promise<AxiosResponse> => {
  const formData = await processToForm(
    name,
    volume,
    imageUri,
    confidence,
    similarity,
    result,
    type,
    box,
  );

  return await apiClient.post("/user/history", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const removeHistory = async (id: string): Promise<AxiosResponse> => {
  return await apiClient.delete(`/user/history/${id}`);
};
export const clearHistory = async (): Promise<AxiosResponse> => {
  return await apiClient.delete("/user/history");
};
