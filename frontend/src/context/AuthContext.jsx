import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await getCurrentUser();

            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                checkAuth,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};