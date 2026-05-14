"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import toast from "react-hot-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";


export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Firestore にユーザー情報を保存（初回のみ）
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            await setDoc(ref, {
                uid: user.uid,
                name: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date(),
            });
        }

        toast.success("ログインしました");
        return { user, error: null };
    } catch (error) {
        toast.error("ログインがキャンセルされました");
        return { user: null, error };
    }
}
