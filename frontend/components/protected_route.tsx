'use client'
import { useContext, useEffect } from "react";
import { AuthContext } from "../lib/auth-context"
import { useRouter } from "next/navigation"
import Spinner from "./Spinner";
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const state = useContext(AuthContext);
    const router = useRouter();

    const profile = state?.profile ?? null;
    const loading = state?.loading ?? true;

    useEffect(() => {
        if (profile == null || (loading == false && Object.keys(profile).length === 0)) {
            router.push("/login");
        }
    }, [profile, loading, router]);

    if (loading) return <Spinner />;
    return <>{children}</>;
}
