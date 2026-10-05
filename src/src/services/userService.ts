import { SERVER_URL } from "@/stores/configStore";
import axios from "axios";

export const login = async (mail: string, password : string) => {
    return await axios.post(`${SERVER_URL}/api/user/login`, 
        {mail, password},    
    )
}

export const register = async (mail: string, password : string) => {
    return await axios.post(`${SERVER_URL}/api/user/register`, 
        {mail, password},    
    )
}