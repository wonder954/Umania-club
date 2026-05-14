import "dotenv/config";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin の環境変数が不足しています");
}

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

console.log("ENV CHECK", {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? "OK" : "MISSING"
});

export const adminDb = getFirestore();
