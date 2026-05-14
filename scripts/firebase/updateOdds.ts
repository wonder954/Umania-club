// scripts/firebase/updateOdds.ts
import { getAdminDb } from "../../src/lib/firebase-admin";

export type OddsEntry = {
    number: number;
    odds: number | null;
    popular: number | null;
};

export async function updateOdds(raceId: string, oddsEntries: OddsEntry[]) {
    const db = getAdminDb(); // ← 遅延初期化（ここが重要）

    const docRef = db.collection("races").doc(raceId);
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
