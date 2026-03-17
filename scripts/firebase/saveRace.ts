// scripts/firebase/saveRace.ts
import { adminDb } from "../scraper/firebase-admin.js";
import type { FirestoreRace } from "../../lib/race/types";

export async function saveRace(race: FirestoreRace) {
    await adminDb.collection("races").doc(race.id).set(race, { merge: true });
    console.log(`🔥 Firestore 保存完了: ${race.id}`);
}