import { getToken } from "@/services/userTokenService";
import { SERVER_URL } from "@/utils/utils";
import axios from "axios";

export const apiClient = axios.create({
    baseURL: SERVER_URL, 
    timeout: 10000,
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
