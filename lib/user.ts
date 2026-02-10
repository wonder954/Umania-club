import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { auth } from "./firebase";


export async function getUserProfile(uid: string) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

export async function updateUserPhoto(uid: string, url: string) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { photoURL: url });
}

export async function updateAuthUserPhoto(url: string) {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
            photoURL: url,
        });
    }
}
