"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type Props = {
    raceName: string;
    courseText: string;
    prediction: Record<string, string>; // marks
    horses: { number?: number; name: string }[];
    comment?: string;
};

export default function ShareImageGenerator({ raceName, courseText, prediction, horses, comment }: Props) {
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

    // Sort horses by mark priority for display? Or loop all?
    // Design request: "Center: Marks + Horse Names (Vertical)"
    // Let's filter only marked horses for the image to keep it clean, or show top ones.
    const markedHorses = horses.filter(h => prediction[h.number?.toString() || ""]);

    // Sort order: ◎(1) > ○(2) > ▲(3) > △(4) > ☆(5)
    // Assuming simpler sort or just mapped order for now.
    const markOrder: Record<string, number> = { "◎": 1, "○": 2, "▲": 3, "△": 4, "☆": 5 };
    markedHorses.sort((a, b) => {
        const markA = prediction[a.number?.toString() || ""];
        const markB = prediction[b.number?.toString() || ""];
        return (markOrder[markA] || 99) - (markOrder[markB] || 99);
    });

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

            {/* 
        Hidden Container for Image Generation 
        Size: 1200x630 (OGP Standard)
        Style: Newspaper / Retro
      */}
            <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <div
                    ref={ref}
                    className="w-[1200px] h-[630px] bg-[#f8f7f2] text-gray-900 font-serif p-16 flex flex-col relative overflow-hidden"
                    style={{
                        // Simple grid pattern css
                        backgroundImage: `
              linear-gradient(#e5e5e5 1px, transparent 1px),
              linear-gradient(90deg, #e5e5e5 1px, transparent 1px)
            `,
                        backgroundSize: "40px 40px"
                    }}
                >
                    {/* Decorative Border */}
                    <div className="absolute inset-4 border-2 border-gray-800 pointer-events-none"></div>
                    <div className="absolute inset-6 border border-gray-400 pointer-events-none"></div>

                    {/* Header */}
                    <div className="relative z-10 text-center border-b-4 border-gray-900 pb-6 mb-8 bg-[#f8f7f2]/80 backdrop-blur-sm mx-auto w-full">
                        <h2 className="text-2xl font-bold text-gray-600 mb-2 tracking-widest">{courseText}</h2>
                        <h1 className="text-7xl font-black text-gray-900 tracking-tighter" style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif' }}>
                            {raceName}
                        </h1>
                    </div>

                    {/* Main Content (Predictions) */}
                    <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                        <div className="bg-white/90 p-8 shadow-sm border border-gray-300 w-full max-w-3xl">
                            {markedHorses.length > 0 ? (
                                markedHorses.map((h) => {
                                    const mark = prediction[h.number?.toString() || ""];
                                    return (
                                        <div key={h.name} className="flex items-end gap-6 mb-5 last:mb-0 border-b border-dashed border-gray-300 pb-2 last:border-0 last:pb-0">
                                            <span className={`
                        text-5xl font-bold leading-none
                        ${mark === "◎" ? "text-red-600" :
                                                    mark === "○" ? "text-blue-600" :
                                                        mark === "▲" ? "text-green-600" : "text-gray-800"}
                      `}>
                                                {mark}
                                            </span>
                                            <span className="text-5xl font-bold font-mono text-gray-800 w-24 text-center">{h.number}</span>
                                            <span className="text-5xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif' }}>
                                                {h.name}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-2xl text-center text-gray-400">注目馬なし</p>
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
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-500 mb-1 tracking-widest">KEIBA YOSO</p>
                            <p className="text-4xl font-black text-gray-900 tracking-widest" style={{ fontFamily: 'serif' }}>
                                UMANIA CLUB
                            </p>
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
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-4 max-w-4xl w-full flex flex-col gap-4 max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div>
                                <h3 className="font-bold text-lg">シェア用画像生成完了！</h3>
                                <p className="text-sm text-gray-500">長押し/右クリックで画像を保存して、SNSでシェアしてください</p>
                            </div>
                            <button onClick={() => setImageUrl(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="bg-gray-100 p-2 rounded border flex justify-center">
                            <img src={imageUrl} alt="Prediction OGP" className="max-w-full h-auto shadow-lg" />
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
                </div>
            )}
        </div>
    );
}
