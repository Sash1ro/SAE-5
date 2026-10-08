import { processImageToForm } from "@/utils/processImage";
import { apiClient } from "./apiService";
import { AxiosResponse } from "axios";

export interface ContributionResp {
  id: string
  status: string
}

const processToForm = async (universe: string, volume: number, imageUri: string) : Promise<FormData> => {
  let formData = new FormData();
  formData.append("universe_name", universe.trim());
  formData.append("universe_volume", volume.toString());
  return await processImageToForm(formData, imageUri)
}

export const uploadToContribute = async (universe: string, volume: number, imageUri: string): Promise<AxiosResponse> =>  {
  const formData = await processToForm(universe, volume, imageUri)

  return await apiClient.post<ContributionResp>("/contributions", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
