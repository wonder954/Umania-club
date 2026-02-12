import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { auth } from "./firebase";


export async function getUserProfile(uid: string) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
        ...data,
        iconUrl: data.iconUrl ?? "/profile-icons/default1.png",
    };
}

export async function updateUserPhoto(uid: string, url: string) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { iconUrl: url });
}

export async function updateAuthUserPhoto(url: string) {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
            photoURL: url,
        });
    }
}

export async function updateUserName(uid: string, name: string) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { name });
}

export async function updateAuthUserName(name: string) {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name });
}

export async function updateUserFavoriteHorse(uid: string, favoriteHorse: string) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { favoriteHorse });
}