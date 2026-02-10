"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/common/LogoutButton";
import { signInWithGoogle } from "@/lib/auth";

export default function Header() {
    const { user, loading } = useAuth();

    return (
        <header className="w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img
                    src="/umania-club logo.png"
                    alt="logo"
                    className="w-10 h-10 object-contain"
                />
                <Link href="/" className="text-xl font-bold">
                    Umania-club
                </Link>
            </div>

            {/* ローディング中 */}
            {loading && <div className="text-sm text-gray-500">読み込み中...</div>}

            {/* 未ログイン */}
            {!loading && !user && (
                <button
                    onClick={signInWithGoogle}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                    ログイン
                </button>
            )}

            {/* ログイン済み */}
            {!loading && user && (
                <div className="flex items-center gap-4">
                    <Link href="/mypage" className="font-medium hover:underline">
                        マイページ
                    </Link>

                    <img
                        src={user.photoURL ?? "/default-user.png"}
                        alt="user icon"
                        className="w-8 h-8 rounded-full border"
                    />
                    <span className="font-medium">{user.displayName}</span>
                    <LogoutButton />
                </div>
            )}
        </header>
    );
}