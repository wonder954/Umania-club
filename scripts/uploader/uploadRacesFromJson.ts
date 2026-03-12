import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { adminDb } from "../scraper/firebase-admin.js";

// <raceId>.json が保存されているベースディレクトリ
const baseDir = path.join(process.cwd(), "scripts", "data");

export async function uploadRacesFromJson() {
    const folders = fs.readdirSync(baseDir).filter(f => /^\d{8}[wf]$/.test(f));
    const latest = folders.sort().reverse()[0];

    if (!latest) {
        console.error("❌ レースフォルダが見つかりません");
        return;
    }

    const racesDir = path.join(baseDir, latest, "races");
    const files = fs.readdirSync(racesDir).filter(f => f.endsWith(".json"));

    console.log(`📦 ${files.length} 件のレースをアップロードします\n`);

    for (const file of files) {
        const race = JSON.parse(fs.readFileSync(path.join(racesDir, file), "utf8"));

        if (!race.raceId || !race.info) {
            console.warn(`⚠️ スキップ: 不完全なデータ (${file})`);
            continue;
        }

        await adminDb.collection("races").doc(race.raceId).set(race);
        console.log(`✅ 保存: ${race.raceId} - ${race.info.title}`);
    }

    console.log("\n🎉 Firestore へのアップロードが完了しました！");
}