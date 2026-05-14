// userCache.ts
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const userCache = new Map<string, any>();

export async function getUserProfile(uid: string) {
    if (userCache.has(uid)) return userCache.get(uid);

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    const data = snap.data();
    userCache.set(uid, data);

    return data;
}

// ★ プロフィールを手動で更新する
export function updateUserCache(uid: string, newData: any) {
    userCache.set(uid, newData);
}

// ★ 必要ならキャッシュをクリアする
export function clearUserCache() {
    userCache.clear();
}