"use client";

export default function ScrollToPostsButton() {
    const handleClick = () => {
        const el = document.getElementById("post-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <button
            onClick={handleClick}
            className="
                w-full py-4 rounded-xl font-bold text-slate-800
                bg-white/70 backdrop-blur-sm
                shadow-sm hover:shadow-md
                border border-white/40
                hover:bg-white/80
                transition
            "
        >
            みんなの予想を見る
        </button>
    );
}