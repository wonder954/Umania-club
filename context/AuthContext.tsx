"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    reloadUser: () => Promise<void>; // ← 必須
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    reloadUser: async () => { }, // ← 必須
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

    // 🔥 これが Header 更新の鍵
    // Helper to clone User object while keeping prototype methods
    const cloneUser = (user: User): User => {
        return Object.assign(Object.create(Object.getPrototypeOf(user)), user);
    };

    // 🔥 これが Header 更新の鍵
    const reloadUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            setUser(cloneUser(auth.currentUser)); // ← Header が即更新される
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, reloadUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}