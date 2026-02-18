import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

type Props = {
    user: User;
    onSubmit: (text: string, visibility: string) => void;
};

export default function PostForm({ user, onSubmit }: Props) {
    const [text, setText] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [groups, setGroups] = useState<any[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            const q = query(
                collection(db, "groups"),
                where("members", "array-contains", user.uid)
            );
            const snap = await getDocs(q);
            setGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchGroups();
    }, [user.uid]);

    const handleSubmit = () => {
        if (!text.trim()) return;
        onSubmit(text, visibility);
        setText("");
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="投稿内容を入力..."
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            />

            {/* 公開範囲 */}
            <div className="mt-3">
                <label className="text-sm text-gray-600">公開範囲</label>
                <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg"
                >
                    <option value="public">全体公開</option>

                    {groups.map((g) => (
                        <option key={g.id} value={`group:${g.id}`}>
                            グループ限定：{g.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
                投稿する
            </button>
        </div>
    );
}