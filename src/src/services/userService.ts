import { apiClient } from "@/services/apiService";
import { AxiosResponse } from "axios";
import { Credentials, UserPublic, AuthResp } from "@/types";

export type { Credentials, UserPublic, AuthResp };

export const login = async (email: string, password : string) : Promise<AxiosResponse> => {
    return await apiClient.post<AuthResp>(`/user/login`, 
        {email, password} as Credentials,    
    )
}

export const register = async (email: string, password : string) : Promise<AxiosResponse> => {
    return await apiClient.post<AuthResp>(`/user/register`, 
        {email, password} as Credentials,    
    )
}

export const me = async () : Promise<AxiosResponse> => {
    return await apiClient.get<UserPublic>(`/user/me`)
}