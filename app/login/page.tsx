"use client";

import LoginButton from "@/components/common/LoginButton";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <p className="text-center mt-20 text-slate-600">
                読み込み中...
            </p>
        );
    }

    return (
        <div
            className="
                flex flex-col items-center justify-center 
                min-h-screen p-8
                bg-white/40 backdrop-blur-sm
            "
        >
            <div
                className="
                    bg-white/70 backdrop-blur-sm 
                    p-10 rounded-2xl 
                    border border-white/40 shadow-sm
                    text-center
                "
            >
                <h1 className="text-3xl font-bold mb-6 text-slate-800">
                    ログイン
                </h1>

                <LoginButton onClick={signInWithGoogle} />
            </div>
        </div>
    );
}