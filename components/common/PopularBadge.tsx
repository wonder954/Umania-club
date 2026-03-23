import { pcPopularColor, mobilePopularColor } from "@/utils/race/popularColor";

// --- PC版 ---
export function PopularBadgePC({ popular }: { popular: number | null }) {
    return (
        <span
            className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${pcPopularColor(popular)}
            `}
        >
            {popular != null ? `${popular}` : "-"}
        </span>
    );
}

// --- モバイル版 ---
export function PopularBadgeMobile({ popular }: { popular: number | null }) {
    const colorClass = mobilePopularColor(popular);

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
            {popular != null ? `${popular}人気` : "-"}
        </span>
    );
}