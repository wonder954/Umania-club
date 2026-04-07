//オッズ更新実装したら使う

import { adminDb } from "../scraper/firebase-admin.js";

export type OddsEntry = {
    number: number;
    odds: number | null;
    popular: number | null;
};

export async function updateOdds(raceId: string, oddsEntries: OddsEntry[]) {
    const docRef = adminDb.collection("races").doc(raceId);
    const doc = await docRef.get();
    const data = doc.data();

    if (!data?.entries) {
        console.warn(`⚠️ entries が見つかりません: ${raceId}`);
        return;
    }

    // 既存の entries にオッズを上書きマージ
    const updatedEntries = data.entries.map((entry: any) => {
        const odds = oddsEntries.find(o => o.number === entry.number);
        if (!odds) return entry;
        return {
            ...entry,
            odds: odds.odds,
            popular: odds.popular,
        };
    });

    await docRef.update({ entries: updatedEntries });
    console.log(`🟡 オッズ更新: ${raceId}`);
}
