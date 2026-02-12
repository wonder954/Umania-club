"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/common/LogoutButton";
import { signInWithGoogle } from "@/lib/auth";

export default function Header() {
    const { user, loading } = useAuth();

    return (
        <header
            className="
                w-full 
                bg-white/60 
                backdrop-blur-sm 
                shadow-sm 
                px-4 py-3 
                flex items-center justify-between
                border-b border-white/40
                sticky top-0 z-50
            "
        >
            {/* 左側：ロゴ（画像のみリンク） */}
            <Link href="/" className="flex items-center py-1">
                <img
                    src="/umania-club logo.png"
                    alt="logo"
                    className="h-14 w-auto object-contain drop-shadow-sm hover:opacity-90 transition-opacity"
                />
            </Link>

            {/* ローディング中 */}
            {loading && (
                <div className="text-sm text-slate-500">
                    読み込み中…
                </div>
            )}

            {/* 未ログイン */}
            {!loading && !user && (
                <button
                    onClick={signInWithGoogle}
                    className="
                        px-4 py-2 
                        bg-white/70 
                        backdrop-blur-sm 
                        text-slate-700 
                        rounded-xl 
                        shadow-sm 
                        hover:shadow-md 
                        border border-white/40 
                        hover:bg-white/80 
                        transition
                    "
                >
                    ログイン
                </button>
            )}

            {/* ログイン済み */}
            {!loading && user && (
                <div className="flex items-center gap-4">

                    {/* アイコン＋名前 → マイページへ */}
                    <Link href="/mypage" className="flex items-center gap-2 group">
                        <img
                            src={user.photoURL ?? "/default-user.png"}
                            alt="user icon"
                            className="
                                w-9 h-9 rounded-full 
                                border border-white/60 
                                shadow-sm 
                                group-hover:scale-105 
                                transition-transform
                            "
                        />
                        <span className="font-medium text-slate-700 group-hover:opacity-80 transition-opacity">
                            {user.displayName}
                        </span>
                    </Link>

                    {/* ログアウト */}
                    <LogoutButton />
                </div>
            )}
        </header>
    );
}