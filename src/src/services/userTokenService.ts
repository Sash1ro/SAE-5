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