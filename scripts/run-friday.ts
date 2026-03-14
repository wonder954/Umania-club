// scripts/run-friday.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { fetchWeeklyRacesYahoo } from "./scraper/yahoo-scraper/index";
import { generateFolderName } from "./utils/saveRaceData";
import { processFridayRace } from "./friday/processFridayRace";
import { mergeRaceId } from "./mergeRaceId";

async function main() {
    console.log("=".repeat(60));
    console.log("Yahoo! 競馬 金曜スクレイピング（確定出馬表版）");
    console.log("=".repeat(60));
    console.log("");

    // =========================
    // 保存フォルダ作成（f = friday）
    // =========================
    const folderName = generateFolderName("f");
    console.log(`📁 保存先フォルダ: ${folderName}\n`);

    // =========================
    // 今週の重賞（一覧取得）
    // =========================
    console.log("[1/3] 今週の重賞一覧を取得中...");
    const races = await fetchWeeklyRacesYahoo();
    console.log(`  → ${races.length} 件のレースを検出\n`);

    let success = 0;
    let error = 0;

    // =========================
    // 今週の重賞（確定出馬表）
    // =========================
    console.log("[2/3] 確定出馬表を取得中...\n");

    for (const race of races) {
        try {
            await processFridayRace(race, folderName);
            success++;
        } catch (err) {
            console.error("  ❌ エラー:", err);
            error++;
        }
    }

    // =========================
    // サマリー
    // =========================
    console.log("\n" + "=".repeat(60));
    console.log("処理完了");
    console.log(`  成功: ${success} 件`);
    console.log(`  エラー: ${error} 件`);
    console.log("=".repeat(60));

    // =========================
    // raceId マージ
    // =========================
    console.log("\n[3/3] JRA 重賞一覧に raceId をマージ中...");
    await mergeRaceId();

    // =========================
    // Firestore アップロード
    // =========================
    console.log("\n[4/4] Firestore にアップロード中...");
    const { uploadRacesFromJson } = await import("./uploader/uploadRacesFromJson.ts");
    await uploadRacesFromJson();
}

main().catch(console.error);