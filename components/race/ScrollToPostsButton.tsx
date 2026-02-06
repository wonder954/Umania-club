"use client";

export default function ScrollToPostsButton() {
    const handleClick = () => {
        const el = document.getElementById("post-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <button
            onClick={handleClick}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition"
        >
            みんなの予想を見る
        </button>
    );
}