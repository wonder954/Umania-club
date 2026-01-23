import dotenv from "dotenv";
dotenv.config(); // ← 明示的に読み込む

import { firebaseConfig } from "../lib/firebase";
console.log("🔍 firebaseConfig:", firebaseConfig);

import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// JSON ファイルの読み込み
const racesFilePath = path.join(process.cwd(), "scripts", "scraper", "data", "races.json");
const raw = fs.readFileSync(racesFilePath, "utf8");
const racesData = JSON.parse(raw) as Record<string, any>;

async function uploadRaces() {
    const raceIds = Object.keys(racesData);
    console.log(`📦 ${raceIds.length} 件のレースをアップロードします\n`);

    for (const id of raceIds) {
        const race = racesData[id];

        if (!race.id || !race.name || !race.date) {
            console.warn(`⚠️ スキップ: 不完全なデータ (${id})`);
            continue;
        }

        try {
            await setDoc(doc(db, "races", id), race);
            console.log(`✅ アップロード完了: ${id} - ${race.name}`);
        } catch (err) {
            console.error(`❌ アップロード失敗: ${id}`, err);
        }
    }

    console.log("\n🎉 Firestore へのアップロードが完了しました！");
}

uploadRaces().catch((err) => {
    console.error("❌ スクリプト実行中にエラー:", err);
});