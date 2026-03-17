import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { adminDb } from "../scraper/firebase-admin.js";

// ★ 正規形への変換関数を読み込む
import { toFirestoreRace } from "@/lib/race/convert";
import { sanitizeFirestoreRace } from "@/lib/race/sanitize";


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
        const json = JSON.parse(fs.readFileSync(path.join(racesDir, file), "utf8"));

        if (!json.raceId || !json.info) {
            console.warn(`⚠️ スキップ: 不完全なデータ (${file})`);
            continue;
        }

        // ★ 正規形に変換
        const race = toFirestoreRace(json);

        // ★ undefined を null に変換
        const safeRace = sanitizeFirestoreRace(race);

        // ★ Firestore に保存
        await adminDb.collection("races").doc(safeRace.id).set(safeRace);

        console.log(`✅ 保存: ${safeRace.id} - ${safeRace.title}`);
    }

    console.log("\n🎉 Firestore へのアップロードが完了しました！");
}