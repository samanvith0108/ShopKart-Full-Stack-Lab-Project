import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || (
    import.meta.env.DEV ? "http://localhost:8000" : undefined
);

if (!baseURL) {
    throw new Error("VITE_API_URL must be configured for production builds.");
}

export const axiosInstance = axios.create({
    baseURL,
    headers :{
        "Content-Type" : 'application/json'
    },
    withCredentials:true
})
