"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileEditor from "@/components/mypage/ProfileEditor";
import {
    getUserProfile,
    updateUserPhoto,
    updateAuthUserPhoto,
} from "@/lib/user";
import { uploadUserIcon } from "@/lib/userIcon"; // ← ここが重要（storage ではなく userIcon）

export default function MyPage() {
    const { user, loading, reloadUser } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);

    // 未ログインならログインへ
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Firestore からプロフィール取得
    useEffect(() => {
        if (user) {
            getUserProfile(user.uid).then((data: any) => {
                setProfile(data as any);
            });
        }
    }, [user]);

    /**
     * プリセット画像を選択したとき
     */
    const handleSelectPhoto = async (url: string): Promise<void> => {
        if (!user) return;
        await updateUserPhoto(user.uid, url);
        await updateAuthUserPhoto(url);
        await reloadUser();
        setProfile({ ...profile, photoURL: url });
    };

    /**
     * カスタム画像をアップロードしたとき
     * → 完全版 onUpload（古いアイコン削除）を呼ぶ
     */
    const handleUploadPhoto = async (file: File): Promise<void> => {
        if (!user) return;
        const currentUrl = profile.photoURL ?? ""; // 現在のアイコンURL

        // 完全版 onUpload（古いアイコン削除）
        const newUrl = await uploadUserIcon(user.uid, file, currentUrl);

        // Firestore と Auth の更新
        await updateUserPhoto(user.uid, newUrl);
        await updateAuthUserPhoto(newUrl);
        await reloadUser();

        // UI 更新
        setProfile({ ...profile, photoURL: newUrl });
    };

    if (loading || !user || !profile) {
        return <p className="text-center mt-20">読み込み中...</p>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-md p-6 relative">

                {/* 編集ボタン */}
                <button
                    onClick={() => setEditing(true)}
                    className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 
                               bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 
                               transition-colors"
                >
                    <span className="material-icons text-sm">edit</span>
                    編集
                </button>

                {/* プロフィール画像 */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        <img
                            src={profile.photoURL ?? "/default.png"}
                            alt="user icon"
                            className="w-20 h-20 rounded-full object-cover border shadow-sm 
                                       transition-transform group-hover:scale-105"
                        />

                        {/* ホバー時の編集アイコン */}
                        <div
                            className="absolute inset-0 bg-black/40 rounded-full opacity-0 
                                       group-hover:opacity-100 flex items-center justify-center 
                                       transition-opacity cursor-pointer"
                            onClick={() => setEditing(true)}
                        >
                            <span className="material-icons text-white text-3xl">
                                photo_camera
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xl font-semibold">{profile.name}</p>
                        <p className="text-gray-500 text-sm">UID: {profile.uid}</p>
                    </div>
                </div>

                {/* 情報セクション */}
                <div className="grid grid-cols-2 gap-y-3 text-gray-700">
                    <p className="text-sm text-gray-500">アカウント作成日</p>
                    <p className="font-medium">
                        {profile.createdAt?.toDate
                            ? profile.createdAt.toDate().toLocaleString()
                            : "不明"}
                    </p>

                    <p className="text-sm text-gray-500">メールアドレス</p>
                    <p className="font-medium">{user.email}</p>
                </div>
            </div>

            {/* 編集モーダル */}
            {editing && (
                <ProfileEditor
                    currentPhoto={profile.photoURL}
                    onSelect={handleSelectPhoto}
                    onUpload={handleUploadPhoto}
                    onClose={() => setEditing(false)}
                />
            )}
        </div>
    );
}