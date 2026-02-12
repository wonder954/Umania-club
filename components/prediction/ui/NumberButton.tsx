"use client";
import { shortenHorseName } from "@/components/prediction/utils/shortenHorseName";

type Props = {
    num: number;
    name: string;
    selected: boolean;
    color?: "red" | "blue";
    disabled?: boolean;
    onClick: () => void;
};

export default function NumberButton({
    num,
    name,
    selected,
    color = "blue",
    disabled = false,
    onClick,
}: Props) {
    const shortName = shortenHorseName(name, 3);

    // 選択時の色（元の色を70%透過）
    const selectedClass =
        color === "red"
            ? "bg-red-500/80 text-white shadow-inner"
            : "bg-blue-500/80 text-white shadow-inner";

    // 未選択時（透明白 × 柔らかい境界線）
    const unselectedClass =
        "bg-white/70 backdrop-blur-sm border border-white/40 text-slate-700 hover:bg-white/90";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                aspect-square rounded-xl 
                flex flex-col items-center justify-center
                font-mono font-bold
                text-base md:text-base
                md:w-19 md:h-19
                shadow-sm transition
                ${selected ? selectedClass : unselectedClass}
                ${disabled ? "opacity-30 cursor-not-allowed" : ""}
            `}
        >
            <span className="text-base md:text-sm leading-none">{num}</span>

            <span
                className={`
                    text-[10px] md:text-[9px] leading-none mt-1
                    ${selected ? "text-white" : "text-slate-600"}
                `}
            >
                {shortName}
            </span>
        </button>
    );
}