"use client";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { Modal } from "@/components/common/Modal";

type Props = {
    raceName: string;
    courseText: string;
    grade: string;
    date: string;
    prediction: Record<string, string>; // marks
    horses: { number?: number | string; name: string }[];
    comment?: string;
};

export default function ShareImageGenerator({ raceName, courseText, grade, date, prediction, horses, comment }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const generateImage = async () => {
        if (!ref.current) return;
        setLoading(true);
        try {
            // Generate at intended size
            const dataUrl = await toPng(ref.current, {
                cacheBust: true,
                pixelRatio: 1, // 1:1 since we set exact pixels
                width: 1200,
                height: 630
            });
            setImageUrl(dataUrl);
        } catch (err) {
            console.error("Image generation failed", err);
        } finally {
            setLoading(false);
        }
    };

    const shareToX = () => {
        const text = encodeURIComponent(`【${raceName}】の予想を公開しました！ #Umania`);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    };

    const MARK_ORDER: Record<string, number> = { "◎": 1, "〇": 2, "▲": 3, "△": 4 };

    const markedHorses = Object.entries(prediction)
        .map(([key, mark]) => {
            const horse =
                horses.find(h => String(h.number) === key) ||
                horses.find(h => h.name === key);

            return {
                mark,
                number: horse?.number ?? null,
                name: horse?.name ?? key,
            };
        })
        .filter(h => h.mark)
        .sort((a, b) => {
            const diff = (MARK_ORDER[a.mark] || 99) - (MARK_ORDER[b.mark] || 99);
            if (diff !== 0) return diff;
            return (Number(a.number) ?? 999) - (Number(b.number) ?? 999);
        });

    // compact モード判定: 5頭以上で2列
    const isCompact = markedHorses.length >= 5;

    // スタイル定義（パディングはJSXで適用）

    return (
        <div className="mt-6 flex flex-col items-center">
            <button
                onClick={generateImage}
                disabled={loading}
                className="mb-4 text-sm bg-gray-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-black transition flex items-center gap-2"
            >
                <span>📸</span>
                {loading ? "画像生成中..." : "SNSシェア用画像を生成する"}
            </button>

            {/* Hidden Container for Image Generation */}
            <div className="fixed top-0 left-0 z-[1] opacity-0 pointer-events-none">
                <div
                    ref={ref}
                    className="w-[1200px] h-[630px] bg-[#f8f7f2] text-gray-900 font-serif p-12 flex flex-col relative overflow-hidden box-border"
                    style={{
                        backgroundImage: `
              linear-gradient(#e5e5e5 1px, transparent 1px),
              linear-gradient(90deg, #e5e5e5 1px, transparent 1px)
            `,
                        backgroundSize: "40px 40px"
                    }}
                >
                    {/* Header (unchanged) */}
                    <div className="relative z-10 text-center border-b-4 border-gray-900 pb-4 mb-4 bg-[#f8f7f2]/80 backdrop-blur-sm mx-auto w-full">
                        <div className="flex justify-center items-center gap-4 mb-1 text-gray-600 font-bold tracking-widest text-lg">
                            <span className="bg-gray-200 px-3 py-1 rounded-sm text-gray-800">{date}</span>
                            <span className="bg-yellow-400 text-black px-3 py-1 rounded-sm shadow-sm">{grade}</span>
                            <span>{courseText}</span>
                        </div>
                        <h1 className="text-6xl font-black text-gray-900 tracking-tighter" style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif' }}>
                            {raceName}
                        </h1>
                    </div>

                    {/* Main Content (Predictions) */}
                    <div className="flex-1 flex flex-col justify-center items-center relative z-10 min-h-0">
                        <div className={`bg-white/95 px-12 shadow-sm border border-gray-300 w-full flex items-center justify-center ${isCompact ? "max-w-5xl" : "max-w-4xl"}`}>
                            {markedHorses.length > 0 ? (
                                <div className={`w-full ${isCompact ? "grid grid-cols-2 gap-x-6 gap-y-6 py-6" : "flex flex-col items-center gap-y-1 py-6"}`}>
                                    {markedHorses.map((h) => {
                                        const mark = h.mark;

                                        return (
                                            <div key={h.name} className={`flex items-center ${isCompact ? "w-full" : "w-[560px]"}`}>
                                                <span className={`
                                                    font-bold leading-none text-center flex-shrink-0
                                                    ${isCompact ? "text-5xl w-20" : "text-6xl w-24"}
                                                    ${mark === "◎" ? "text-red-600" :
                                                        mark === "〇" ? "text-blue-600" :
                                                            mark === "▲" ? "text-green-600" : "text-gray-800"}
                                                `}>
                                                    {mark}
                                                </span>
                                                {h.number && (
                                                    <span className={`font-mono font-bold text-gray-500 text-right mr-3 flex-shrink-0 ${isCompact ? "text-2xl w-14" : "text-3xl w-20"}`}>
                                                        {h.number}番
                                                    </span>
                                                )}
                                                <span className={`font-bold text-gray-900 truncate ${isCompact ? "text-3xl" : "text-4xl"}`} style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif' }}>
                                                    {h.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-3xl text-center text-gray-400 font-bold py-10">注目馬なし</p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 mt-auto pt-6 flex justify-between items-end border-t-2 border-gray-900">
                        <div className="max-w-3xl">
                            {comment && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 relative shadow-sm">
                                    <span className="absolute -top-3 left-4 bg-[#f8f7f2] px-2 text-xs text-gray-500 font-bold border border-gray-300">COMMENT</span>
                                    <p className="text-2xl font-bold text-gray-800 leading-relaxed">
                                        “{comment}”
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-end justify-end space-x-3">
                            <img
                                src="/umania-club logo.png"
                                alt="UMANIA CLUB Logo"
                                className="h-12 w-auto translate-y-1"
                            />
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-500 tracking-widest">KEIBA YOSO</p>
                                <p
                                    className="text-4xl font-black text-gray-900 tracking-widest"
                                    style={{ fontFamily: 'serif' }}
                                >
                                    UMANIA CLUB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stamp effect (optional) */}
                    <div className="absolute top-10 right-10 opacity-10 rotate-12 pointer-events-none">
                        <div className="w-32 h-32 border-4 border-red-600 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-bold text-2xl">予想<br />公開</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Preview Modal */}
            {imageUrl && (
                <Modal open={!!imageUrl} onClose={() => setImageUrl(null)}>
                    <div className="flex flex-col gap-4 max-w-4xl w-full max-h-[90vh] overflow-auto">

                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">シェア用画像生成完了！</h3>
                                <p className="text-sm text-gray-500">
                                    長押し/右クリックで画像を保存して、SNSでシェアしてください
                                </p>
                            </div>
                            <button
                                onClick={() => setImageUrl(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* ★ 透明感のあるプレビュー背景 */}
                        <div className="
                bg-white/40 
                backdrop-blur-md 
                p-4 
                rounded-2xl 
                border border-white/50 
                shadow-xl 
                flex justify-center
            ">
                            <img
                                src={imageUrl}
                                alt="Prediction OGP"
                                className="max-w-full h-auto rounded-xl shadow-lg"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={() => setImageUrl(null)}
                                className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-full font-bold transition"
                            >
                                閉じる
                            </button>
                            <button
                                onClick={shareToX}
                                className="px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800 shadow-lg flex items-center gap-2"
                            >
                                <span>𝕏</span>
                                <span>Xに投稿する</span>
                            </button>
                        </div>

                    </div>
                </Modal>
            )}
        </div>
    );
}
