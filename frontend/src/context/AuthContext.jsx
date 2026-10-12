import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getCurrentUser,
    logoutUser,
} from "../services/auth.service";

import { socket } from "../socket/socket";
import { useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { pathname } = useLocation();
    const isAdminRoute = pathname.startsWith("/admin");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await getCurrentUser();
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            setUser(null);

            if (error.status !== 401) {
                console.error(
                    "Unable to check user authentication:",
                    error.message
                );
            }

            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAdminRoute) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        checkAuth();
    }, [isAdminRoute]);

    useEffect(() => {
        if (isLoading || !user) {
            return;
        }

        const handleNewMessage = (message) => {
            if (!message?._id) {
                return;
            }

            socket.emit("message-delivered", {
                messageId: message._id,
            });
        };

        const handleConnectionRequestReceived = (
            data
        ) => {
            window.dispatchEvent(
                new CustomEvent(
                    "nexora:connection-request-received",
                    {
                        detail: data,
                    }
                )
            );
        };

        const handleConnectionRequestRemoved = (
            data
        ) => {
            window.dispatchEvent(
                new CustomEvent(
                    "nexora:connection-request-removed",
                    {
                        detail: data,
                    }
                )
            );
        };

        socket.on(
            "new-message",
            handleNewMessage
        );

        socket.on(
            "connection-request-received",
            handleConnectionRequestReceived
        );

        socket.on(
            "connection-request-removed",
            handleConnectionRequestRemoved
        );

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off(
                "new-message",
                handleNewMessage
            );

            socket.off(
                "connection-request-received",
                handleConnectionRequestReceived
            );

            socket.off(
                "connection-request-removed",
                handleConnectionRequestRemoved
            );
        };
    }, [user, isLoading]);


    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            socket.disconnect();
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
                refreshUser: checkAuth,
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