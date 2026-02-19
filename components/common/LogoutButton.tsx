"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { useEffect } from "react"

export default function LogoutButton() {
    const { logout, user, loading } = useAuth();
    const router = useRouter();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [doneOpen, setDoneOpen] = useState(false);

    // LogoutButton.tsx
    const handleLogout = async () => {
        setConfirmOpen(false);

        // ふわっと出すために少し遅らせる
        setTimeout(() => {
            setDoneOpen(true);
        }, 200);

        await logout();
    };

    useEffect(() => {
        if (!doneOpen) return;

        const timer = setTimeout(() => {
            setDoneOpen(false);
            router.push("/");
        }, 2500); // 2.5秒表示

        return () => clearTimeout(timer); // クリーンアップ
    }, [doneOpen]);

    return (
        <>
            {/* ログアウトボタン（スマホはアイコンのみ） */}
            {!loading && user && (
                <button
                    onClick={() => setConfirmOpen(true)}
                    className="
            flex items-center gap-1
            px-3 py-1.5
            bg-gray-100 text-gray-700 text-sm rounded-full
            hover:bg-gray-200 hover:shadow-sm transition-all

            sm:px-3 sm:py-1.5
            md:px-3 md:py-1.5
        "
                >
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />

                    {/* PC のみ文字表示 */}
                    <span className="hidden md:inline">ログアウト</span>
                </button>
            )}

            {/* 確認モーダル */}
            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <div className="text-center space-y-4 py-6">
                    <p className="text-lg font-bold">本当にログアウトしますか？</p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setConfirmOpen(false)}
                            className="px-4 py-2 bg-gray-200 rounded-lg"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg"
                        >
                            はい
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 完了モーダル */}
            <Modal open={doneOpen} onClose={() => setDoneOpen(false)}>
                <div className="text-center py-6 animate-fadeInSlow">
                    <p className="text-lg font-bold mb-2">ログアウトしました</p>
                    <p className="text-sm text-gray-600">またいつでも遊びに来てね！</p>
                </div>
            </Modal>
        </>
    );
}