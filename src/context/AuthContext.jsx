import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) { 
    const [accessToken, setAccessToken] = useState(undefined);

    // ✅ Axios 인스턴스 생성
    const authApi = axios.create({
        baseURL: `${API_URL}`,
        withCredentials: true,
    });

    // // ✅ accessToken 변경 시 Axios 인터셉터 설정 (AuthProvider 내부에서 실행)
    // useEffect(() => {
    //     const requestInterceptor = authApi.interceptors.request.use(
    //         (config) => {
    //             if (accessToken) {
    //                 config.headers.Authorization = `Bearer ${accessToken}`;
    //             }
    //             return config;
    //         },
    //         (error) => Promise.reject(error)
    //     );

    //     return () => {
    //         authApi.interceptors.request.eject(requestInterceptor);
    //     };
    // }, [accessToken]); // ✅ accessToken 변경 시 인터셉터 업데이트

    // // ✅ 새로고침 시 accessToken 자동 갱신
    // useEffect(() => {
    //     const refreshAccessToken = async () => {
    //         try {
    //             const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
    //             setAccessToken(response.data.accessToken);
    //         } catch (error) {
    //             setAccessToken(null);
    //         }
    //     };

    //     refreshAccessToken();
    // }, []);

    // return (
    //     <AuthContext.Provider value={{ accessToken, setAccessToken, authApi }}>
    //         {children}
    //     </AuthContext.Provider>
    // );
}

export function useAuth() { 
    return useContext(AuthContext);
}
