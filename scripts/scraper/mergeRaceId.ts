// scripts/scraper/mergeRaceId.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
// グレード正規化
// ===============================
function normalizeGrade(g: string): string {
    if (!g) return "";

    // まず全角を半角に統一
    let normalized = g
        .replace(/[ⅠⅡⅢ]/g, (match) => {
            if (match === 'Ⅰ') return 'I';
            if (match === 'Ⅱ') return 'II';
            if (match === 'Ⅲ') return 'III';
            return match;
        })
        .replace(/[ⅰⅱⅲ]/g, (match) => {
            if (match === 'ⅰ') return 'I';
            if (match === 'ⅱ') return 'II';
            if (match === 'ⅲ') return 'III';
            return match;
        })
        .replace(/[ⅠⅡⅢⅣⅤ]/g, (match) => {
            const map: Record<string, string> = {
                'Ⅰ': 'I',
                'Ⅱ': 'II',
                'Ⅲ': 'III',
            };
            return map[match] || match;
        })
        .replace(/・/g, "")
        .toUpperCase();

    // "GI", "GII", "GIII" などを "I", "II", "III" に統一
    normalized = normalized
        .replace(/^G/, "")
        .replace(/^JP/, "")  // 地方競馬用
        .trim();

    return normalized;
}

// ===============================
// タイトル正規化
// ===============================
function cleanTitle(title: string): string {
    if (!title) return "";

    return title
        .replace(/\s+/g, "")                    // 改行・空白除去
        .replace(/GIII|GII|GI|G3|G2|G1/gi, "") // グレード表記除去
        .replace(/[（(].*?[）)]/g, "")          // カッコ内除去(全角・半角両対応)
        .replace(/ステークス|S$/g, "")          // ステークス除去
        .trim();
}

// ===============================
// マッチングロジック
// ===============================
function matchRaceId(jraRace: JraRace, yahooList: YahooRace[]): string | undefined {
    const jName = cleanTitle(jraRace.name);
    const jGrade = normalizeGrade(jraRace.grade);
    const jDate = jraRace.date;

    console.log(`\n🔍 マッチング試行: ${jraRace.name} (${jDate}, ${jGrade})`);
    console.log(`   正規化後: "${jName}"`);

    for (const y of yahooList) {
        const yName = cleanTitle(y.title);
        const yGrade = normalizeGrade(y.grade);

        // デバッグ出力
        if (y.date === jDate) {
            console.log(`   候補: ${y.title} (${y.date}, ${yGrade}) → "${yName}"`);
        }

        // マッチング条件
        const dateMatch = y.date === jDate;
        const gradeMatch = yGrade === jGrade;

        // タイトルマッチング（複数パターン）
        const titleMatch =
            yName === jName ||                          // 完全一致
            yName.includes(jName) ||                    // Yahoo側が長い
            jName.includes(yName) ||                    // JRA側が長い
            (jName.length >= 3 && yName.length >= 3 &&  // 前方3文字一致
                jName.slice(0, 3) === yName.slice(0, 3));

        if (dateMatch && gradeMatch && titleMatch) {
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

    console.log(`📁 対象フォルダ: ${weekFolders.join(", ")}`);

    let yahooList: YahooRace[] = [];

    for (const week of weekFolders) {
        const racesDir = path.join(dataDir, week, "races");
        if (!fs.existsSync(racesDir)) continue;

        const files = fs.readdirSync(racesDir);
        for (const file of files) {
            if (!file.endsWith('.json')) continue;

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
                console.error(`⚠️  ファイル読み込みエラー: ${file}`, error);
            }
        }
    }

    console.log(`📄 Yahoo! レースデータ件数: ${yahooList.length}`);

    let updated = 0;
    let notFound = 0;

    for (const race of jraRaces) {
        const raceId = matchRaceId(race, yahooList);
        if (raceId) {
            race.id = raceId;
            updated++;
        } else {
            notFound++;
            console.warn(`⚠️  マッチ失敗: ${race.name} (${race.date}, ${race.grade})`);
        }
    }

    const outputPath = path.join(__dirname, "data/2026_grades_merged.json");
    fs.writeFileSync(outputPath, JSON.stringify(jraRaces, null, 2), "utf8");

    console.log(`\n✅ raceId マージ完了: ${updated} 件更新`);
    console.log(`❌ マッチ失敗: ${notFound} 件`);
    console.log(`📄 保存先: data/2026_grades_merged.json`);

    return updated;
}