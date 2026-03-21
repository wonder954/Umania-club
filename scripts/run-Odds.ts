// scripts/run-Odds.ts
import { adminDb } from "./scraper/firebase-admin.js";
import { getOdds } from "./scraper/yahoo-scraper/getOdds.js";
import { updateOdds } from "./firebase/updateOdds.js";

async function runOdds() {
    console.log("🟡 オッズ更新開始");

    // ① Firestore から「結果が null のレース」を取得
    const snapshot = await adminDb
        .collection("races")
        .where("result", "==", null)
        .get();

    const raceIds = snapshot.docs.map(doc => doc.id);
    console.log(`▶ オッズ更新対象レース数: ${raceIds.length}`);

    for (const raceId of raceIds) {
        try {
            const url = `https://sports.yahoo.co.jp/keiba/race/denma/${raceId}`;
            console.log(`▶ ${raceId} のオッズ取得中...`);

            // ② オッズだけ取得
            const oddsEntries = await getOdds(url);

            // ③ Firestore の entries に部分更新
            await updateOdds(raceId, oddsEntries);

            console.log(`✅ ${raceId} のオッズ更新完了`);
        } catch (err) {
            console.error(`❌ ${raceId} のオッズ更新失敗`, err);
        }
    }

    console.log("🟡 オッズ更新完了");
}

runOdds();