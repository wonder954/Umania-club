import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage } from "@/lib/storage";
import { db } from "./firebase";

export async function uploadUserIcon(uid: string, file: File, currentIconUrl: string) {
    // 1. 古いアイコンがデフォルトなら削除しない
    const isDefaultIcon = currentIconUrl.includes("/profile-icons/default");

    // 2. 新しいファイルの保存先
    const filePath = `icons/${uid}/${Date.now()}-${file.name}`;
    const fileRef = ref(storage, filePath);

    // 3. 新しいアイコンをアップロード
    await uploadBytes(fileRef, file);

    // 4. 新しいURLを取得
    const newUrl = await getDownloadURL(fileRef);

    // 5. Firestore を更新（icon に統一）
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { icon: newUrl });

    // 6. 古いアイコンを削除（デフォルト以外）
    if (!isDefaultIcon && currentIconUrl) {
        try {
            const oldRef = ref(storage, currentIconUrl);
            await deleteObject(oldRef);
        } catch (err) {
            console.warn("古いアイコンの削除に失敗:", err);
        }
    }

    return newUrl;
}