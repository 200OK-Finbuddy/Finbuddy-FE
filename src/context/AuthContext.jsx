import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import authApi from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // ✅ 로그인한 사용자 정보 저장

    // 현재 로그인한 사용자 정보 가져오기
    const fetchUser = async () => {
        try {
            const response = await authApi.get("/api/me", {
                withCredentials: true,
            });
            setUser(response.data); // ✅ 로그인한 사용자 정보 저장
        } catch (error) {
            setUser(null); // 로그인 정보 없음
        }
    };

    // 로그인 상태 유지 (앱이 처음 실행될 때)
    useEffect(() => {
        fetchUser();
    }, []);

    // 로그인 처리
    const login = async (email, password) => {
        try {
            await authApi.post("/api/auth/signin", { email, password });
            await fetchUser(); // ✅ 로그인 성공 후 사용자 정보 가져오기
            return true; // ✅ 로그인 성공 시 true 반환
        } catch (error) {
            console.error("로그인 실패", error);
            return false; // ❌ 로그인 실패 시 false 반환
        }
    };
    

    // 로그아웃 처리
    const logout = async () => {
        try {
            await authApi.post("/api/auth/logout");
            setUser(null); // ✅ 로그아웃 처리
        } catch (error) {
            console.error("로그아웃 실패", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 🔹 useAuth 훅 생성 (편리하게 로그인 상태 사용)
export const useAuth = () => {
    return useContext(AuthContext);
};
