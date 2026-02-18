'use client';

import { db } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    addDoc,
    deleteDoc,
    Timestamp,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";

export type UserProfile = {
    uid: string;
    name: string | null;
    icon: string | null;
    provider: "anonymous" | "google";
    createdAt: Timestamp;
};

export async function saveUser(user: UserProfile) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            name: user.name ?? "名無し",
            icon: user.icon ?? "/profile-icons/default1.png", // ★ 追加
            provider: user.provider,
            createdAt: Timestamp.now()
        });
    }
}

export async function createPost(raceId: string, postData: any) {
    // 1. races/{raceId}/posts に保存（投稿IDを取得）
    const postsRef = collection(db, "races", raceId, "posts");
    const newPostRef = await addDoc(postsRef, {
        authorId: postData.authorId,
        visibility: postData.visibility ?? "public",
        prediction: postData.prediction ?? {},
        bets: postData.bets ?? [],
        comment: postData.comment ?? "",
        raceId: postData.raceId,
        raceName: postData.raceName,
        createdAt: Timestamp.now()
    });

    const postId = newPostRef.id;

    // 2. posts_all/{postId} にも保存（横断検索用）
    const allRef = doc(db, "posts_all", postId);
    await setDoc(allRef, {
        id: postId,
        authorId: postData.authorId,
        authorName: postData.authorName,
        authorIcon: postData.authorIcon,
        visibility: postData.visibility ?? "public",
        prediction: postData.prediction ?? {},
        bets: postData.bets ?? [],
        comment: postData.comment ?? "",
        raceId: postData.raceId,
        raceName: postData.raceName,
        createdAt: Timestamp.now()
    });

    return postId;
}

export async function getRacePosts(raceId: string) {
    const postsRef = collection(db, "races", raceId, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deletePost(raceId: string, postId: string) {
    // races/{raceId}/posts/{postId}
    const postRef = doc(db, "races", raceId, "posts", postId);
    await deleteDoc(postRef);

    // posts_all/{postId}
    const allRef = doc(db, "posts_all", postId);
    await deleteDoc(allRef);
}

export async function addComment(raceId: string, postId: string, commentData: any) {
    const commentsRef = collection(db, "races", raceId, "posts", postId, "comments");

    await addDoc(commentsRef, {
        text: commentData.text,
        authorId: commentData.authorId,
        parentId: commentData.parentId ?? null,
        createdAt: Timestamp.now()
    });
}

export async function getPostComments(raceId: string, postId: string) {
    const commentsRef = collection(db, "races", raceId, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteComment(raceId: string, postId: string, commentId: string) {
    const ref = doc(db, "races", raceId, "posts", postId, "comments", commentId);
    await deleteDoc(ref);
}

export async function togglePostLike(raceId: string, postId: string, userId: string) {
    const ref = doc(db, "races", raceId, "posts", postId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const likes: string[] = data.likes ?? [];

    if (likes.includes(userId)) {
        // いいね解除
        await updateDoc(ref, {
            likes: arrayRemove(userId)
        });
    } else {
        // いいね追加
        await updateDoc(ref, {
            likes: arrayUnion(userId)
        });
    }
}

export async function toggleCommentLike(
    raceId: string,
    postId: string,
    commentId: string,
    userId: string
) {
    const ref = doc(db, "races", raceId, "posts", postId, "comments", commentId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const likes: string[] = data.likes ?? [];

    if (likes.includes(userId)) {
        await updateDoc(ref, { likes: arrayRemove(userId) });
    } else {
        await updateDoc(ref, { likes: arrayUnion(userId) });
    }
}

export async function updateUserProfile(uid: string, data: any) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, data);
}

export async function createGroup(name: string, ownerId: string) {
    const ref = await addDoc(collection(db, "groups"), {
        name,
        ownerId,
        members: [ownerId],
        createdAt: serverTimestamp(),
    });

    return ref.id;
}
