'use client'
import { ProtectedRoute } from "@/components/protected_route";

export default function ProtectedLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}