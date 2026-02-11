"use client";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

export const storage = getStorage(app);

export async function uploadUserIcon(uid: string, file: File) {
    const storageRef = ref(storage, `icons/${uid}.png`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}