// scripts/firebase/saveRace.ts
import { adminDb } from "../../src/lib/firebase-admin.js";
import type { FirestoreRace } from "../../src/lib/race/types";

export async function saveRace(race: FirestoreRace) {
    await adminDb.collection("races").doc(race.id).set(race, { merge: false });
    console.log(`🔥 Firestore 保存完了: ${race.id}`);
}