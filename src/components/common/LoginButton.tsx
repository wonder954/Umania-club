"use client";

export default function LoginButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="
                flex items-center gap-3 
                px-5 py-2 
                bg-white/70 backdrop-blur-sm
                border border-white/40 
                rounded-xl shadow-sm 
                hover:bg-white/90 
                transition font-medium
                text-slate-800
            "
        >
            {/* Google アイコン（存在しない場合の fallback） */}
            <img
                src="/google-icon.png"
                alt="Google"
                className="w-5 h-5"
                onError={(e) => {
                    // アイコンが無い場合はシンプルな丸アイコンに置き換える
                    (e.target as HTMLImageElement).style.display = "none";
                }}
            />

            Googleでログイン
        </button>
    );
}