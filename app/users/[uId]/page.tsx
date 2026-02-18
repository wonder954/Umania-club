"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function UserProfilePage() {
    const { uId } = useParams();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const ref = doc(db, "users", uId as string);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setProfile(snap.data());
            }
        };

        fetchUser();
    }, [uId]);

    if (!profile) {
        return <p className="text-center mt-20">読み込み中...</p>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
            <div className="flex items-center gap-4">
                <img
                    src={profile.icon}
                    className="w-20 h-20 rounded-full border"
                />
                <div>
                    <h1 className="text-xl font-bold">{profile.name}</h1>
                    <p className="text-gray-500 text-sm">
                        好きな馬: {profile.favoriteHorse ?? "未設定"}
                    </p>
                </div>
            </div>
        </div>
    );
}