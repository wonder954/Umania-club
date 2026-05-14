import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { auth } from "./firebase";

// Firestore からユーザープロフィール取得（icon に統一）
export async function getUserProfile(uid: string) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
        ...data,
        icon: data.icon ?? "/profile-icons/default1.png", // ★ icon に統一
    };
}

// Firestore のユーザーアイコンを更新（icon に統一）
export async function updateUserPhoto(uid: string, url: string) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { icon: url }); // ★ icon に統一
}

// Firebase Auth の photoURL を更新
export async function updateAuthUserPhoto(url: string) {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
            photoURL: url,
        });
    }
}

// Firestore のユーザー名を更新
export async function updateUserName(uid: string, name: string) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { name });
}

// Firebase Auth の displayName を更新
export async function updateAuthUserName(name: string) {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name });
}

// 好きな馬を更新
export async function updateUserFavoriteHorse(uid: string, favoriteHorse: string) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { favoriteHorse });
}