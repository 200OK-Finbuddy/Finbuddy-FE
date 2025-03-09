import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";

const authApi = axios.create({
    baseURL: `${API_URL}`,
    withCredentials: true,
});

// authApi.interceptors.request.use(
//     (config) => {
//         const { accessToken } = useAuth();
//         if (accessToken) {
//             config.headers.Authorization =`Bearer ${accessToken}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// )

export default authApi;
