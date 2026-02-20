"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    reloadUser: () => Promise<void>;
    loginGoogle: () => Promise<void>;    // 追加
    loginAnonymous: () => Promise<void>; // 追加
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    reloadUser: async () => { },
    loginGoogle: async () => { },
    loginAnonymous: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const cloneUser = (user: User): User => {
        return Object.assign(Object.create(Object.getPrototypeOf(user)), user);
    };

    const reloadUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            setUser(cloneUser(auth.currentUser));
        }
    };

    // ↓ 追加
    const loginGoogle = async () => {
        const { googleProvider } = await import("@/lib/firebase-auth");
        const { signInWithPopup } = await import("firebase/auth");
        const { saveUser } = await import("@/lib/db");
        const { Timestamp } = await import("firebase/firestore");
        const result = await signInWithPopup(auth, googleProvider);
        const u = result.user;
        await saveUser({
            uid: u.uid,
            name: u.displayName || "Anonymous",
            icon: u.photoURL || "/profile-icons/default1.png",
            provider: "google",
            createdAt: Timestamp.now()
        });
    };

    const loginAnonymous = async () => {
        const { signInAnonymously } = await import("firebase/auth");
        await signInAnonymously(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, reloadUser, loginGoogle, loginAnonymous }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}