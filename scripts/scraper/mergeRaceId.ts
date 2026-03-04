// scripts/scraper/mergeRaceId.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { cleanTitle } from "@/utils/race/normalize";
import { normalizeGrade } from "@/utils/race/raceGradeUtils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// 型定義
// ===============================
type JraRace = {
    id: string;
    name: string;
    grade: string;
    date: string;
};

type YahooRace = {
    raceId: string;
    date: string;
    title: string;
    grade: string;
};

// ===============================
// マッチングロジック
// ===============================
function matchRaceId(jraRace: JraRace, yahooList: YahooRace[]): string | undefined {
    const jName = cleanTitle(jraRace.name);        // ★ 検索用の正規化
    const jGrade = normalizeGrade(jraRace.grade);
    const jDate = jraRace.date;

    console.log(`\n🔍 マッチング試行: ${jraRace.name} (${jDate}, ${jGrade})`);

    for (const y of yahooList) {
        if (y.date !== jDate) continue;

        const yName = cleanTitle(y.title);           // ★ 検索用の正規化
        const yGrade = normalizeGrade(y.grade);

        const titleMatch =
            jName === yName ||
            jName.includes(yName) ||
            yName.includes(jName);

        if (titleMatch && jGrade === yGrade) {
            console.log(`   ✅ マッチ成功: ${y.raceId}`);
            return y.raceId;
        }
    }

    console.log(`   ❌ マッチ失敗`);
    return undefined;
}

// ===============================
// メイン処理
// ===============================
export async function mergeRaceId(): Promise<number> {
    console.log("🔄 JRA 重賞一覧に raceId をマージ開始...");

    const jraPath = path.join(__dirname, "data/2026_grades.json");
    const jraRaces: JraRace[] = JSON.parse(fs.readFileSync(jraPath, "utf8"));

    const dataDir = path.join(__dirname, "data");
    const weekFolders = fs.readdirSync(dataDir).filter(f => f.endsWith("w"));

    let yahooList: YahooRace[] = [];

    for (const week of weekFolders) {
        const racesDir = path.join(dataDir, week, "races");
        if (!fs.existsSync(racesDir)) continue;

        for (const file of fs.readdirSync(racesDir)) {
            if (!file.endsWith(".json")) continue;

            const raceId = file.replace(".json", "");
            const filePath = path.join(racesDir, file);

            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
                yahooList.push({
                    raceId,
                    date: data.info.date,
                    title: data.info.title,
                    grade: data.info.grade,
                });
            } catch (error) {
                console.error(`⚠️ ファイル読み込みエラー: ${file}`, error);
            }
        }
    }

    let updated = 0;
    let notFound = 0;

    for (const race of jraRaces) {
        const raceId = matchRaceId(race, yahooList);
        if (raceId) {
            race.id = raceId;
            updated++;
        } else {
            notFound++;
            console.warn(`⚠️ マッチ失敗: ${race.name} (${race.date}, ${race.grade})`);
        }
    }

    const outputPath = path.join(__dirname, "data/2026_grades_merged.json");
    fs.writeFileSync(outputPath, JSON.stringify(jraRaces, null, 2), "utf8");

    console.log(`\n✅ raceId マージ完了: ${updated} 件更新`);
    console.log(`❌ マッチ失敗: ${notFound} 件`);
    console.log(`📄 保存先: data/2026_grades_merged.json`);

    return updated;
}