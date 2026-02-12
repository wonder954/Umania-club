"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileEditor from "@/components/mypage/ProfileEditor";
import {
    getUserProfile,
    updateUserPhoto,
    updateAuthUserPhoto,
    updateUserName,
    updateAuthUserName,
    updateUserFavoriteHorse,
} from "@/lib/user";
import { uploadUserIcon } from "@/lib/userIcon";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function MyPage() {
    const { user, loading, reloadUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);

    const [name, setName] = useState("");
    const [favoriteHorse, setFavoriteHorse] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            getUserProfile(user.uid).then((data: any) => {
                setProfile(data);
                setName(data.name ?? "");
                setFavoriteHorse(data.favoriteHorse ?? "");
            });
        }
    }, [user]);

    const handleSelectPhoto = async (url: string): Promise<void> => {
        if (!user) return;
        await updateUserPhoto(user.uid, url);
        await updateAuthUserPhoto(url);
        await reloadUser();
        setProfile({ ...profile, iconUrl: url });
    };

    const handleUploadPhoto = async (file: File): Promise<void> => {
        if (!user) return;
        const currentUrl = profile.iconUrl ?? "";

        const newUrl = await uploadUserIcon(user.uid, file, currentUrl);

        await updateUserPhoto(user.uid, newUrl);
        await updateAuthUserPhoto(newUrl);
        await reloadUser();

        setProfile({ ...profile, iconUrl: newUrl });
    };

    const handleSaveAll = async () => {
        if (!user) return;

        await updateUserName(user.uid, name);
        await updateUserFavoriteHorse(user.uid, favoriteHorse);
        await updateAuthUserName(name);
        await reloadUser();

        setProfile({
            ...profile,
            name,
            favoriteHorse,
        });

        setEditing(false);
    };

    if (loading || !user || !profile) {
        return <p className="text-center mt-20 text-slate-600">読み込み中...</p>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10">

            <div
                className="
        bg-white/70 backdrop-blur-sm 
        rounded-2xl shadow-sm 
        p-6 relative 
        border border-white/40
    "
            >
                {/* 編集ボタン */}
                <button
                    onClick={() => setEditing(true)}
                    className="
            absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5
            bg-white/70 backdrop-blur-sm text-slate-800 text-sm rounded-full
            hover:bg-white/90 hover:shadow-sm transition-all border border-white/40
        "
                >
                    <PencilIcon className="w-4 h-4 text-slate-600" />
                    編集
                </button>

                {/* プロフィール画像 */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        <img
                            src={profile.iconUrl ?? "/profile-icons/default1.png"}
                            alt="user icon"
                            className="
                    w-20 h-20 rounded-full object-cover 
                    border border-white/60 shadow-sm 
                    transition-transform group-hover:scale-105
                "
                        />

                        <div
                            className="
                    absolute inset-0 bg-slate-900/30 rounded-full opacity-0 
                    group-hover:opacity-100 flex items-center justify-center 
                    transition-opacity cursor-pointer
                "
                            onClick={() => setEditing(true)}
                        >
                            <span className="material-icons text-white text-3xl">
                                photo_camera
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xl font-semibold text-slate-800">{profile.name}</p>
                        <p className="text-slate-500 text-sm">UID: {profile.uid}</p>
                        <p className="text-slate-600 text-sm mt-1">
                            好きな馬: {profile.favoriteHorse ?? "未設定"}
                        </p>
                    </div>
                </div>

                {/* 情報セクション */}
                <div className="grid grid-cols-2 gap-y-3 text-slate-700">
                    <p className="text-sm text-slate-500">アカウント作成日</p>
                    <p className="font-medium">
                        {profile.createdAt?.toDate
                            ? profile.createdAt.toDate().toLocaleString()
                            : "不明"}
                    </p>

                    <p className="text-sm text-slate-500">メールアドレス</p>
                    <p className="font-medium">{user.email}</p>
                </div>
            </div>

            {/* 編集モーダル */}
            {editing && (
                <ProfileEditor
                    currentPhoto={profile.iconUrl}
                    name={name}
                    favoriteHorse={favoriteHorse}
                    onChangeName={setName}
                    onChangeFavoriteHorse={setFavoriteHorse}
                    onSelect={handleSelectPhoto}
                    onUpload={handleUploadPhoto}
                    onSave={handleSaveAll}
                    onClose={() => setEditing(false)}
                />
            )}
        </div>
    );
}