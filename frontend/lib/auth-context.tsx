'use client'
import { createContext, useState, useEffect } from "react"
import logger from "./pino";
import { authState } from "../types/authState";
import { BACKEND_URL } from "./config";
export type AuthContextValue = authState & {
    logout: () => void;
};

function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("jwt_token");
}

function storeToken(token: string) {
    localStorage.setItem("jwt_token", token);
}

function clearStoredToken() {
    localStorage.removeItem("jwt_token");
}

function consumeUrlToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
        storeToken(token);
        params.delete("token");
        const cleaned = params.toString();
        const newUrl = window.location.pathname + (cleaned ? `?${cleaned}` : "") + window.location.hash;
        window.history.replaceState({}, "", newUrl);
    }
}

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
                const res = await fetch(`${BACKEND_URL}/me`, {
                    credentials: "include",
                });
                if (!res.ok) {
                    console.log("Error fetching user info: %s", res.status);
                    setAuthState({
                        profile: {},
                        loading: false,
                    });

                    return;

                }

                const data = await res.json();
                if (data.user_info) {
                    console.log("User info fetched successfully:", data.user_info);
                    setAuthState({
                        profile: data.user_info ?? {},
                        loading: false,
                    });
                } else {
                    setAuthState({
                        profile: {},
                        loading: false,
                    });
                }

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
