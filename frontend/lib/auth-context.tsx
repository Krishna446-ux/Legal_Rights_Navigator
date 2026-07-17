'use client'
import { createContext, useState, useEffect } from "react"
import logger from "./pino";
import { authState } from "../types/authState";
export type AuthContextValue = authState & {
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | any>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setAuthState] = useState<authState>({ profile: {}, loading: true });

    const logout = () => {
        setAuthState({ profile: {}, loading: false });
    };

    useEffect(() => {
        logger.info("Fetching user info...");
        async function loadUser() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, { credentials: "include", });
                if (!res.ok) {
                    console.log("Error fetching user info: %s", res.status);
                    setAuthState({
                        profile: {},
                        loading: false,
                    });

                    return;

                }

                const data = await res.json();
                console.log("User info fetched successfully:", data.user_info);
                setAuthState({
                    profile: data.user_info ?? {},
                    loading: false,
                });

            } catch (err) {

                logger.error(err, "Error fetching user info:");

                setAuthState({

                    profile: {},

                    loading: false,

                });

            }

        }

        loadUser();

    }, []);
    console.log("Auth state:", state);
    const value = {
        ...state,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}