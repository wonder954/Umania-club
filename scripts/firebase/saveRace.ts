// scripts/firebase/saveRace.ts
import { getAdminDb } from "../../src/lib/firebase-admin.js";
import type { FirestoreRace } from "../../src/lib/race/types";

export async function saveRace(race: FirestoreRace) {
    const db = getAdminDb(); // ← 遅延初期化（ここが重要）

    await db.collection("races").doc(race.id).set(race, { merge: false });

    console.log(`🔥 Firestore 保存完了: ${race.id}`);
}
