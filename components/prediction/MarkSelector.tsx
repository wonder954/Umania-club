const MARKS = [
    { label: "◎", color: "text-red-600" },
    { label: "〇", color: "text-blue-600" }, // 入力は「〇」（漢数字）
    { label: "▲", color: "text-green-600" },
    { label: "△", color: "text-gray-600" },
];

// 排他制御ロジックを分離
export function updatePrediction(
    currentPrediction: Record<string, string>,
    targetKey: string,
    newMark: string
): Record<string, string> {
    const newVal = { ...currentPrediction };

    // 1. 同じ印を押した → 解除
    if (newVal[targetKey] === newMark) {
        delete newVal[targetKey];
        return newVal;
    }

    // 2. 特殊ルール: ◎〇▲は1つのみ
    if (["◎", "〇", "▲"].includes(newMark)) {
        // 既にその印を持っている他の馬から削除
        Object.keys(newVal).forEach(key => {
            if (newVal[key] === newMark) {
                delete newVal[key];
            }
        });
        newVal[targetKey] = newMark;
    } else if (newMark === "△") {
        // 3. △は4頭まで
        const count = Object.values(newVal).filter(m => m === "△").length;
        if (count >= 4) {
            alert("△は4頭までです");
            return currentPrediction; // 変更なし
        }
        newVal[targetKey] = newMark;
    }

    return newVal;
}

type Props = {
    prediction: Record<string, string>;
    targetKey: string;
    onChange: (newPrediction: Record<string, string>) => void;
};

export default function MarkSelector({ prediction, targetKey, onChange }: Props) {
    let currentMark = prediction[targetKey];
    // 互換性対応: 記号の「○」が保存されている場合は漢数字の「〇」として扱う
    if (currentMark === "○") currentMark = "〇";

    const handleSelect = (mark: string) => {
        const newPrediction = updatePrediction(prediction, targetKey, mark);
        onChange(newPrediction);
    };

    return (
        <div className="flex gap-1 justify-center">
            {MARKS.map((m) => {
                const isSelected = currentMark === m.label;
                return (
                    <button
                        key={m.label}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault(); // Form送信防止
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