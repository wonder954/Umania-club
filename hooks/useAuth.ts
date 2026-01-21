'use client'

import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase-auth";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInAnonymously,
    signOut,
    User
} from "firebase/auth";
import { saveUser } from "@/lib/db";
import { Timestamp } from "firebase/firestore";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.error("Auth is not initialized. Please check your Firebase configuration.");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Save/Update user profile in Firestore
                try {
                    await saveUser({
                        uid: currentUser.uid,
                        name: currentUser.displayName || "Anonymous",
                        provider: currentUser.isAnonymous ? "anonymous" : "google",
                        createdAt: Timestamp.now()
                    });
                } catch (error) {
                    console.error("Failed to save user to Firestore:", error);
                    console.error("This might be due to missing Firebase configuration or Firestore rules.");
                    // Continue anyway - user is still authenticated locally
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginGoogle = async () => {
        if (!auth) {
            console.error("Cannot login: Auth not initialized");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Login Error:", error);
        }
    };

    const loginAnonymous = async () => {
        if (!auth) {
            console.error("Cannot login: Auth not initialized");
            return;
        }
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Anonymous Login Error:", error);
        }
    };

    const logout = async () => {
        if (!auth) {
            console.error("Cannot logout: Auth not initialized");
            return;
        }
        await signOut(auth);
    };

    return { user, loading, loginGoogle, loginAnonymous, logout };
}