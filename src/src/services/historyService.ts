import { apiClient } from "@/services/apiService";
import { processImageToForm } from "@/utils/processImage";
import { AxiosResponse } from "axios";

export interface History {
    universe_name: string,
    universe_volume: number,
    image: string,
    ia_confidence: number,
    ia_similarity: number,
    history_result: string,
    history_type: string,
    created_at?: string;
}

export enum RESULT {
    SUCCESS="success",
    FAILED="failed",
}

export enum TYPE {
    DETECTION="detection",
    CONTRIBUTION="contribution",
}

export const getHistory = async (id: string) : Promise<AxiosResponse> => {
    return await apiClient.get<History>(`/user/history/${id}`)
}

export const getAllHisotry = async () : Promise<AxiosResponse> => {
    return await apiClient.get<History[]>("/user/history")
}

const processToForm = async (
    universe: string,
    volume: number,
    imageUri: string,
    confidence: number,
    similarity: number,
    result: string,
    type: string): Promise<FormData> => {
    let formData = new FormData();
    formData.append("universe_name", universe.trim());
    formData.append("universe_volume", volume.toString());
    formData.append("ia_confidence", confidence.toString());
    formData.append("ia_similarity", similarity.toString());
    formData.append("history_result", result.trim());
    formData.append("history_type", type.trim());
    return await processImageToForm(formData, imageUri)
}

export const addToHistory = async (
    name: string,
    volume: number,
    imageUri: string,
    confidence: number,
    similarity: number,
    result: string,
    type: string) : Promise<AxiosResponse> => {
    const formData = await processToForm(name, volume, imageUri, confidence, similarity, result, type)

    return await apiClient.post("/user/history", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export const removeHistory = async (id: string) : Promise<AxiosResponse> => {
    return await apiClient.delete(`/user/history/${id}`)
}
export const clearHistory = async () : Promise<AxiosResponse> => {
    return await apiClient.delete("/user/history")
}