"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

export default function GroupCreatePage() {
    const { user } = useAuth();  // ← これが重要！

    const [name, setName] = useState("");
    const [createdGroup, setCreatedGroup] = useState<null | { id: string }>(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!user) {
            alert("ログインしてください");
            return;
        }

        if (!name.trim()) return;

        setLoading(true);

        const inviteCode = nanoid(6);

        const docRef = await addDoc(collection(db, "groups"), {
            name,
            ownerId: user.uid,
            members: [user.uid],
            createdAt: serverTimestamp(),
        });

        setCreatedGroup({ id: docRef.id });
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-xl font-bold mb-4">グループを作成</h1>

            <label className="text-sm text-gray-600">グループ名</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg focus:ring focus:ring-blue-200"
                placeholder="例: 競馬仲間グループ"
            />

            <button
                onClick={handleCreate}
                disabled={loading}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
                {loading ? "作成中..." : "グループを作成"}
            </button>

            {createdGroup && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium">グループが作成されました！</p>
                    <p className="text-sm mt-3">招待リンク:</p>
                    <p className="text-blue-600 break-all">
                        {`${window.location.origin}/invite/${createdGroup.id}`}
                    </p>

                    <button
                        onClick={() => {
                            const text = `グループに参加してね！\n招待リンク: ${window.location.origin}/invite/${createdGroup.id}`;
                            const encoded = encodeURIComponent(text);
                            window.location.href = `https://line.me/R/msg/text/?${encoded}`;
                        }}
                        className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg"
                    >
                        LINEで共有する
                    </button>
                </div>
            )}
        </div>
    );
}