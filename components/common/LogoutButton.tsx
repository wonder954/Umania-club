"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LogoutButton() {
    const { logout } = useAuth();

    return (
        <button
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5
             bg-gray-100 text-gray-700 text-sm rounded-full
             hover:bg-gray-200 hover:shadow-sm transition-all"
        >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            ログアウト
        </button>
    );
}