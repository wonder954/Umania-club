//オッズ更新実装したら使う

import { adminDb } from "../scraper/firebase-admin.js";

export type OddsEntry = {
    number: number;
    odds: number | null;
    popular: number | null;
};

export async function updateOdds(raceId: string, entries: OddsEntry[]) {
    await adminDb.collection("races").doc(raceId).set(
        { oddsEntries: entries },
        { merge: true }
    );
    console.log(`🟡 オッズ更新: ${raceId}`);
}
