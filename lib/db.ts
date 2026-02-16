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
    Timestamp
} from "firebase/firestore";

export type UserProfile = {
    uid: string;
    name: string | null;
    provider: "anonymous" | "google";
    createdAt: Timestamp;
};

export async function saveUser(user: UserProfile) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        await setDoc(userRef, user);
    }
}

export async function createPost(raceId: string, postData: any) {
    const postsRef = collection(db, "races", raceId, "posts");

    await addDoc(postsRef, {
        ...postData,
        authorId: postData.authorId,
        visibility: postData.visibility ?? "public",
        authorName: postData.authorName,
        authorIcon: postData.authorIcon,
        createdAt: Timestamp.now()
    });
}

export async function getRacePosts(raceId: string) {
    const postsRef = collection(db, "races", raceId, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deletePost(raceId: string, postId: string) {
    const postRef = doc(db, "races", raceId, "posts", postId);
    await deleteDoc(postRef);
}

export async function addComment(raceId: string, postId: string, commentData: any) {
    const commentsRef = collection(db, "races", raceId, "posts", postId, "comments");
    await addDoc(commentsRef, {
        ...commentData,
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
