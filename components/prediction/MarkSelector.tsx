import type { Mark } from "@/types/mark";

const MARKS: { label: Mark; color: string }[] = [
    { label: "◎", color: "text-red-600" },
    { label: "〇", color: "text-blue-600" },
    { label: "▲", color: "text-green-600" },
    { label: "△", color: "text-gray-600" },
];

// 排他制御ロジック
export function updatePrediction(
    currentPrediction: Record<string, Mark>,
    targetKey: string,
    newMark: Mark
): Record<string, Mark> {
    const newVal = { ...currentPrediction };

    if (newVal[targetKey] === newMark) {
        delete newVal[targetKey];
        return newVal;
    }

    if (["◎", "〇", "▲"].includes(newMark)) {
        Object.keys(newVal).forEach(key => {
            if (newVal[key] === newMark) {
                delete newVal[key];
            }
        });
        newVal[targetKey] = newMark;
    } else if (newMark === "△") {
        const count = Object.values(newVal).filter(m => m === "△").length;
        if (count >= 4) {
            alert("△は4頭までです");
            return currentPrediction;
        }
        newVal[targetKey] = newMark;
    }

    return newVal;
}

type Props = {
    prediction: Record<string, Mark>;
    targetKey: string;
    onChange: (newPrediction: Record<string, Mark>) => void;
    filter?: Mark[]; // ← 追加
};

export default function MarkSelector({ prediction, targetKey, onChange, filter }: Props) {
    const currentMark = prediction[targetKey];

    const handleSelect = (mark: Mark) => {
        const newPrediction = updatePrediction(prediction, targetKey, mark);
        onChange(newPrediction);
    };

    // filter がある場合は対象の印だけ表示
    const marksToShow = filter
        ? MARKS.filter(m => filter.includes(m.label))
        : MARKS;

    return (
        <div className="flex gap-1 justify-center">
            {marksToShow.map((m) => {
                const isSelected = currentMark === m.label;
                return (
                    <button
                        key={m.label}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSelect(m.label);
                        }}
                        className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition
                            ${isSelected
                                ? `bg-white border-2 border-current ${m.color} shadow-sm scale-110`
                                : "bg-transparent border-gray-100 text-gray-300 hover:text-gray-400"
                            }
                        `}
                    >
                        {m.label}
                    </button>
                );
            })}
        </div>
    );
}