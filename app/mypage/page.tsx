"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileEditor from "@/components/mypage/ProfileEditor"; // ← 追加予定
import {
    getUserProfile,
    updateUserPhoto,
    updateAuthUserPhoto,
} from "@/lib/user";
import { uploadUserIcon } from "@/lib/storage";

export default function MyPage() {
    const { user, loading, reloadUser } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false); // ← 追加

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            getUserProfile(user.uid).then((data: any) => {
                setProfile(data as any);
            });
        }
    }, [user]);

    if (loading || !user || !profile) {
        return <p className="text-center mt-20">読み込み中...</p>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">マイページ</h1>

            <div className="flex items-center gap-4 mb-6">
                <img
                    src={profile.photoURL ?? "/default.png"}
                    alt="user icon"
                    className="w-16 h-16 rounded-full border"
                />
                <div>
                    <p className="text-xl font-semibold">{profile.name}</p>
                    <p className="text-gray-500 text-sm">UID: {profile.uid}</p>
                </div>
            </div>

            <div className="text-gray-700 mb-6">
                <p>アカウント作成日：</p>
                <p className="font-medium">
                    {profile.createdAt?.toDate
                        ? profile.createdAt.toDate().toLocaleString()
                        : "不明"}
                </p>
            </div>

            {/* ← ここに置くのがベスト */}
            <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                プロフィール編集
            </button>

            {/* 編集モーダル（後で実装） */}
            {editing && (
                <ProfileEditor
                    currentPhoto={profile.photoURL}
                    onSelect={async (url) => {
                        await updateUserPhoto(user.uid, url);     // Firestore 更新
                        await updateAuthUserPhoto(url);           // Auth の photoURL 更新
                        await reloadUser();
                        setProfile({ ...profile, photoURL: url }); // ローカル状態更新
                        setEditing(false);
                    }}
                    onUpload={async (file) => {
                        const url = await uploadUserIcon(user.uid, file);
                        await updateUserPhoto(user.uid, url);     // Firestore 更新
                        await updateAuthUserPhoto(url);           // Auth の photoURL 更新
                        await reloadUser();
                        setProfile({ ...profile, photoURL: url }); // ローカル状態更新
                        setEditing(false);
                    }}
                />
            )}
        </div>
    );
}