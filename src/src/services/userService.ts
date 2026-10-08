import { apiClient } from "@/services/apiService";

export const login = async (email: string, password : string) => {
    return await apiClient.post(`/api/user/login`, 
        {email, password},    
    )
}

export const register = async (email: string, password : string) => {
    return await apiClient.post(`/api/user/register`, 
        {email, password},    
    )
}

export const me = async () => {
    return await apiClient.get(`/api/user/me`)
}