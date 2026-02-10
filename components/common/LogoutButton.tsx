"use client";

import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
    const { logout } = useAuth();

    return (
        <button
            onClick={logout}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
            ログアウト
        </button>
    );
}