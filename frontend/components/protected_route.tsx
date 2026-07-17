'use client'
import { useContext, useEffect } from "react";
import { AuthContext } from "../lib/auth-context"
import { useRouter } from "next/navigation"
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const state = useContext(AuthContext);
    const router = useRouter();

    const isAuthenticated = !!state && state.loading == false && Object.keys(state).length > 0

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    return <>{children}</>;
}
