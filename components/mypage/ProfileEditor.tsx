"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";


type ProfileEditorProps = {
    currentPhoto: string | null;
    name: string;
    favoriteHorse: string;
    onChangeName: (value: string) => void;
    onChangeFavoriteHorse: (value: string) => void;
    onSelect: (url: string) => Promise<void> | void;
    onUpload: (file: File) => Promise<void> | void;
    onSave: () => Promise<void>;
    onClose: () => void;
};

const PRESET_ICONS = [
    "/profile-icons/default1.png",
    "/profile-icons/default2.png",
    "/profile-icons/default3.png",
];

export default function ProfileEditor({
    currentPhoto,
    name,
    favoriteHorse,
    onChangeName,
    onChangeFavoriteHorse,
    onSelect,
    onUpload,
    onSave,
    onClose,
}: ProfileEditorProps) {
    const [preview, setPreview] = useState<string>(currentPhoto ?? "/profile-icons/default1.png");
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setPreview(currentPhoto ?? "/profile-icons/default1.png");
    }, [currentPhoto]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        const url = URL.createObjectURL(f);
        setPreview(url);
    };

    const handleSelectPreset = async (url: string) => {
        setFile(null);
        setPreview(url);
        await onSelect(url);
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (file) {
                await onUpload(file);
            }

            await onSave();

            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 900);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-5">

            {/* 名前 */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    名前
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onChangeName(e.target.value)}
                    className="
                        w-full px-3 py-2 rounded-lg text-sm
                        bg-white/60 backdrop-blur-sm
                        border border-white/40 shadow-sm
                        focus:ring-blue-300 focus:border-blue-300
                    "
                    placeholder="名前を入力"
                />
            </div>

            {/* 好きな馬 */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    好きな馬
                </label>
                <input
                    type="text"
                    value={favoriteHorse}
                    onChange={(e) => onChangeFavoriteHorse(e.target.value)}
                    className="
                        w-full px-3 py-2 rounded-lg text-sm
                        bg-white/60 backdrop-blur-sm
                        border border-white/40 shadow-sm
                        focus:ring-blue-300 focus:border-blue-300
                    "
                    placeholder="例: オルフェーヴル"
                />
            </div>

            {/* 現在のアイコン */}
            <div>
                <p className="text-sm font-medium text-slate-700 mb-2">現在のアイコン</p>
                <div className="flex items-center gap-3">
                    <img
                        src={preview}
                        alt="preview"
                        className="w-20 h-20 rounded-full object-cover border border-white/60 shadow-sm"
                    />
                    <p className="text-xs text-slate-500">
                        プリセットを選ぶか、画像をアップロードできます。
                    </p>
                </div>
            </div>

            {/* プリセット */}
            <div>
                <p className="text-sm font-medium text-slate-700 mb-2">デフォルトアイコン</p>
                <div className="flex gap-3">
                    {PRESET_ICONS.map((icon) => (
                        <button
                            key={icon}
                            type="button"
                            onClick={() => handleSelectPreset(icon)}
                            className={`
                                w-14 h-14 rounded-full border border-white/40 overflow-hidden
                                transition transform
                                ${preview === icon
                                    ? "ring-4 ring-blue-300/70 scale-105 shadow-md"
                                    : "hover:scale-105 hover:shadow-sm"
                                }
                            `}
                        >
                            <img src={icon} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* アップロード */}
            <div>
                <p className="text-sm font-medium text-slate-700 mb-2">カスタム画像をアップロード</p>
                <label
                    className="
                        flex flex-col items-center justify-center gap-2
                        border-2 border-dashed border-white/40 rounded-xl
                        py-4 cursor-pointer
                        bg-white/40 backdrop-blur-sm
                        hover:bg-white/60 transition
                    "
                >
                    <span className="text-sm text-slate-700">クリックして画像を選択</span>
                    <span className="text-xs text-slate-500">正方形の画像がおすすめです</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
            </div>

            {/* フッター */}
            <div className="mt-6 flex items-center justify-between">
                {saved ? (
                    <span className="text-sm text-green-600 min-w-0">保存しました</span>
                ) : (
                    <span className="text-xs text-slate-500 min-w-0">
                        アイコン・名前・好きな馬が保存されます
                    </span>
                )}

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`
            shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm
            transition
            ${isSaving
                            ? "bg-blue-300 cursor-wait scale-95"
                            : "bg-blue-500/80 hover:bg-blue-500/90"
                        }
        `}
                >
                    {isSaving ? "保存中..." : "保存する"}
                </button>
            </div>
        </div>
    );
}
