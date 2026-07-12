import axios from 'axios';

const API_URL = 'http://localhost:8000'

export const uploadFile = async (data) => {
    try{
       let response = await axios.post(`${API_URL}/upload`, data);
       return response.data;
    }catch(error){
        console.log("Error while calling api" , error.message);
    }
}


export const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (res.status === 429) {
        // Throw a special error that components can catch
        const err = new Error("Too many requests. Please try again in a minute.");
        err.isRateLimit = true;  // flag so UI knows exactly what happened
        throw err;
    }

    return res;
};