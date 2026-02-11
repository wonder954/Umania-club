"use client";

import { useRef, useState } from "react";


export default function ProfileEditor({
    currentPhoto,
    onSelect,
    onUpload,
    onClose,
}: {
    currentPhoto: string;
    onSelect: (url: string) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
    onClose: () => void;
}) {
    const defaultIcons = [
        "/profile-icons/default1.png",
        "/profile-icons/default2.png",
        "/profile-icons/default3.png",
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string>(currentPhoto);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState<false | "show" | "fadeout">(false);

    const handleFileChange = (file: File) => {
        setPreview(URL.createObjectURL(file));
        setSelectedFile(file);
        setError(null);
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            if (selectedFile) {
                await onUpload(selectedFile);
            } else {
                await onSelect(preview);
            }

            // 保存成功アニメーション
            setSaved("show");

            // まず 600ms 表示させる
            setTimeout(() => {
                // フェードアウト開始
                setSaved("fadeout");
            }, 600);

            // フェードアウトが終わる 800ms 後に閉じる
            setTimeout(() => {
                onClose();
                setSaved(false);
            }, 600 + 800);

        } catch (err) {
            console.error("画像保存エラー:", err);
            setError("画像の保存に失敗しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">

                {/* 保存完了アニメーション */}
                {saved && (
                    <div
                        className={`
      absolute inset-0 flex items-center justify-center 
      bg-white/90 backdrop-blur-sm rounded-xl z-50
      ${saved === "fadeout" ? "animate-fadeOut" : ""}
    `}
                    >
                        <div className="text-green-600 text-xl font-bold flex items-center gap-2 drop-shadow">
                            <span className="text-3xl">✔</span>
                            保存しました
                        </div>
                    </div>
                )}

                {/* ✕ ボタン */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4">プロフィール画像を変更</h2>

                {/* エラーメッセージ */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* プレビュー */}
                <div className="flex justify-center mb-4">
                    <img
                        src={preview}
                        alt="プレビュー"
                        className="w-24 h-24 rounded-full border shadow-sm object-cover"
                    />
                </div>

                {/* 現在のアイコン */}
                <p className="mb-2 text-gray-600">現在のアイコンに戻す</p>
                <div className="flex gap-4 mb-6">
                    <img
                        src={currentPhoto}
                        alt="現在のアイコン"
                        onClick={() => {
                            if (!loading) {
                                setPreview(currentPhoto);
                                setSelectedFile(null);
                                setError(null);
                            }
                        }}
                        className={`w-16 h-16 rounded-full border cursor-pointer transition
                            ${preview === currentPhoto ? "ring-4 ring-blue-400" : "hover:opacity-80"}
                            ${loading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    />
                </div>

                {/* デフォルトアイコン */}
                <p className="mb-2 text-gray-600">デフォルトアイコンを選択</p>
                <div className="flex gap-4 mb-6">
                    {defaultIcons.map((icon) => (
                        <img
                            key={icon}
                            src={icon}
                            alt="デフォルトアイコン"
                            onClick={() => {
                                if (!loading) {
                                    setPreview(icon);
                                    setSelectedFile(null);
                                    setError(null);
                                }
                            }}
                            className={`w-16 h-16 rounded-full border cursor-pointer transition 
                                ${preview === icon ? "ring-4 ring-blue-400" : "hover:opacity-80"}
                                ${loading ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        />
                    ))}
                </div>

                {/* アップロード */}
                <p className="mb-2 text-gray-600">画像をアップロード</p>

                <div
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center 
                              transition ${loading
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-gray-50"
                        }`}
                    onClick={() => !loading && fileInputRef.current?.click()}
                >
                    <p className="text-gray-600">クリックして画像を選択</p>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    disabled={loading}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(file);
                    }}
                />

                {/* 保存ボタン */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="mt-6 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                             transition disabled:bg-blue-300 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white 
                                           border-t-transparent rounded-full"></span>
                            保存中...
                        </>
                    ) : (
                        "保存する"
                    )}
                </button>
            </div>
        </div>
    );
}