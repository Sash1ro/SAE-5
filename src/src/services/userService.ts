import { SERVER_URL } from "@/stores/configStore";
import axios from "axios";
import { getCache, setCache } from "./cacheService";

const CACHE_KEY = '@user_token';

export const getToken = async () : Promise<string | null> => {
    const token = await getCache(CACHE_KEY)
    if(token.found && token.data) return token.data as string
    return null
}

export const saveToken = async (token: string | null) => {
    await setCache(CACHE_KEY, token)
}

export const deleteToken = async () => {
    return await saveToken(null)
}

export const login = async (email: string, password : string) => {
    return await axios.post(`${SERVER_URL}/api/user/login`, 
        {email, password},    
    )
}

export const register = async (email: string, password : string) => {
    return await axios.post(`${SERVER_URL}/api/user/register`, 
        {email, password},    
    )
}

export const me = async () => {
    const token = await getToken()
    return await axios.get(`${SERVER_URL}/api/user/me`, {
        headers : {
            "Authorization": `Bearer ${token}`
        }
    })
}