import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getCurrentAdmin,
    logoutAdmin as logoutAdminService,
} from "../services/adminAuth.service";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAdminAuth = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await getCurrentAdmin();

            setAdmin(response.data.admin);

            return response.data.admin;
        } catch (error) {
            setAdmin(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAdminAuth();
    }, [checkAdminAuth]);

    
    const logoutAdmin = async () => {
        try {
            await logoutAdminService();
        } finally {
            setAdmin(null);
        }
    };

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                setAdmin,
                isLoading,
                checkAdminAuth,
                logoutAdmin,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error(
            "useAdminAuth must be used within an AdminAuthProvider"
        );
    }

    return context;
};