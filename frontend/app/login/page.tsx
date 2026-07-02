'use client'
import Link from 'next/link'
import { useEffect, useContext } from 'react';
import { AuthContext } from '@/lib/auth-context';
import { useRouter } from 'next/dist/client/components/navigation';

export default function Login() {
    const router = useRouter();
    const authState = useContext(AuthContext);
    const state = authState ?? { profile: {}, loading: true };
    useEffect(() => {

        if (Object.keys(state.profile).length > 0)
            router.push("/");
    }, [state, router]);
    return (

        <div className="flex min-h-screen items-center justify-center bg-gray-100">

            <Link

                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`}

                className="flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-gray-800 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-95 border border-gray-200"

            >

                <svg

                    className="h-6 w-6"

                    viewBox="0 0 48 48"

                    xmlns="http://www.w3.org/2000/svg"

                >

                    <path

                        fill="#FFC107"

                        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.5 0 19-8.5 19-19 0-1.3-.1-2.3-.4-3.5z"

                    />

                    <path

                        fill="#FF3D00"

                        d="M6.3 14.7l6.6 4.8C14.7 15.2 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"

                    />

                    <path

                        fill="#4CAF50"

                        d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3.3-11.4-8l-6.5 5C9.4 39.5 16.1 44 24 44z"

                    />

                    <path

                        fill="#1976D2"

                        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.6-6.3 7.2l6.2 5.2C39 36.8 44 31.2 44 24c0-1.3-.1-2.3-.4-3.5z"

                    />

                </svg>

                <span className="font-medium">Continue with Google</span>

            </Link>

        </div>

    );
}
