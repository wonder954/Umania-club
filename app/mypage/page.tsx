"use client";

import { updateUserCache } from "@/lib/userCache";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CameraIcon, PencilIcon } from "@heroicons/react/24/outline";
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

import { Modal } from "@/components/common/Modal";
import { useModal } from "@/hooks/useModal";
import Link from "next/link";

export default function MyPage() {
    const { user, loading, reloadUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);

    const profileModal = useModal();

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

    // ★ 写真を選択したとき（icon に統一）
    const handleSelectPhoto = async (url: string): Promise<void> => {
        if (!user) return;
        await updateUserPhoto(user.uid, url);
        await updateAuthUserPhoto(url);
        await reloadUser();
        setProfile({ ...profile, icon: url });

        // ★ userCache を更新
        updateUserCache(user.uid, { ...profile, icon: url });
    };

    // ★ 写真をアップロードしたとき（icon に統一）
    const handleUploadPhoto = async (file: File): Promise<void> => {
        if (!user) return;

        const currentUrl = profile.icon ?? "";

        const newUrl = await uploadUserIcon(user.uid, file, currentUrl);

        await updateUserPhoto(user.uid, newUrl);
        await updateAuthUserPhoto(newUrl);
        await reloadUser();

        setProfile({ ...profile, icon: newUrl });

        // ★ userCache を更新
        updateUserCache(user.uid, { ...profile, icon: newUrl });

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

        profileModal.hide();
    };

    if (loading || !user || !profile) {
        return <p className="text-center mt-20 text-slate-600">読み込み中...</p>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 relative border border-white/40">

                {/* 編集ボタン */}
                <button
                    onClick={profileModal.show}
                    className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5
                        bg-white/70 backdrop-blur-sm text-slate-800 text-sm rounded-full
                        hover:bg-white/90 hover:shadow-sm transition-all border border-white/40"
                >
                    <PencilIcon className="w-4 h-4 text-slate-600" />
                    編集
                </button>

                {/* プロフィール画像 */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        <img
                            src={profile.icon ?? "/profile-icons/default1.png"}
                            alt="user icon"
                            className="w-20 h-20 rounded-full object-cover border border-white/60 shadow-sm transition-transform group-hover:scale-105"
                        />

                        <div
                            className="absolute inset-0 bg-slate-900/30 rounded-full opacity-0 
                                group-hover:opacity-100 flex items-center justify-center 
                                transition-opacity cursor-pointer"
                            onClick={profileModal.show}
                        >
                            <CameraIcon className="w-6 h-6 text-white" />
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
                {/* グループ管理セクション */}
                <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/40">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                        グループ管理
                    </h2>

                    <p className="text-slate-600 text-sm mb-4">
                        あなたが所属しているグループの管理や、新しいグループの作成ができます。
                    </p>

                    <div className="flex gap-3">
                        <Link
                            href="/groups"
                            className="px-4 py-2 bg-white/80 text-slate-700 rounded-xl border border-white/40 shadow-sm hover:bg-white transition"
                        >
                            グループ一覧へ
                        </Link>

                        <Link
                            href="/groups/create"
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-sm hover:bg-blue-600 transition"
                        >
                            グループを作成
                        </Link>
                    </div>
                </div>
            </div>

            {/* 編集モーダル */}
            <Modal open={profileModal.open} onClose={profileModal.hide}>
                <ProfileEditor
                    currentPhoto={profile.icon}
                    name={name}
                    favoriteHorse={favoriteHorse}
                    onChangeName={setName}
                    onChangeFavoriteHorse={setFavoriteHorse}
                    onSelect={handleSelectPhoto}
                    onUpload={handleUploadPhoto}
                    onSave={handleSaveAll}
                    onClose={profileModal.hide}
                />
            </Modal>
        </div>
    );
}