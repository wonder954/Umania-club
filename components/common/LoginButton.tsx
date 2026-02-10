"use client";

export default function LoginButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-5 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition font-medium"
        >
            <img src="/google-icon.png" alt="" className="w-5 h-5" />
            Googleでログイン
        </button>
    );
}