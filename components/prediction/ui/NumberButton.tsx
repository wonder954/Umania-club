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

    const selectedClass =
        color === "red"
            ? "bg-red-600 text-white shadow-inner"
            : "bg-blue-600 text-white shadow-inner";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
    aspect-square rounded flex flex-col items-center justify-center
    font-mono font-bold
    text-base md:text-base        
    md:w-19 md:h-19             /* ← PC で全体サイズを縮小 */
    ${selected ? selectedClass : "bg-white border text-gray-700 hover:bg-gray-100"}
    ${disabled ? "opacity-30 cursor-not-allowed" : ""}
  `}
        >
            <span className="text-base md:text-sm leading-none">{num}</span>
            <span
                className={`
      text-[10px] md:text-[9px] leading-none mt-1
      ${selected ? "text-white" : "text-gray-600"}
    `}
            >
                {shortName}
            </span>
        </button>
    );
}