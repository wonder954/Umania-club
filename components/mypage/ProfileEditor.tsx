"use client";

import { useState } from "react";

export default function ProfileEditor({
    currentPhoto,
    onSelect,
    onUpload,
}: {
    currentPhoto: string;
    onSelect: (url: string) => void;
    onUpload: (file: File) => void;
}) {
    const defaultIcons = [
        "/profile-icons/default1.png",
        "/profile-icons/default2.png",
        "/profile-icons/default3.png",
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">プロフィール画像を変更</h2>

            <p className="mb-2 text-gray-600">デフォルトアイコンを選択</p>
            <div className="flex gap-4 mb-6">
                {defaultIcons.map((icon) => (
                    <img
                        key={icon}
                        src={icon}
                        onClick={() => onSelect(icon)}
                        className={`w-16 h-16 rounded-full border cursor-pointer transition ${currentPhoto === icon ? "ring-4 ring-blue-400" : "hover:opacity-80"
                            }`}
                    />
                ))}
            </div>

            <p className="mb-2 text-gray-600">画像をアップロード</p>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    if (e.target.files?.[0]) onUpload(e.target.files[0]);
                }}
            />
        </div>
    );
}