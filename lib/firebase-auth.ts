'use client'

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase";

// Initialize Auth
// This file should strictly be used in Client Contexts or where Auth is needed
let auth: any;
try {
    if (app) {
        auth = getAuth(app);
    } else {
        console.error("Firebase App is undefined in firebase-auth.ts");
    }
} catch (e) {
    console.error("Error initializing Auth:", e);
}

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
