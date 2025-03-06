import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";

const AuthContext = createContext(); 

export function AuthProvider({ children }) { 
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const refreshAccessToken = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
            setAccessToken(response.data.accessToken);
        } catch (error) {
            setAccessToken(null);
        }
        };

        refreshAccessToken();
    }, []);

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() { 
    return useContext(AuthContext);
}
