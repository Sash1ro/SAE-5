import { apiClient } from "@/services/apiService";

export interface History {
    universe_name : string,
    universe_volume: string,
    image_64: string,
    ia_confidence: number,
    ia_similarity: number,
    history_result: string,
    history_type: string
}

export const get = async () => {}
export const getAll = async () => {}
export const add = async () => {}
export const remove = async () => {}
export const clear = async () => {}