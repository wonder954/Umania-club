import { fileURLToPath } from "url";
import path from "path";
import admin from "firebase-admin";
import fs from "fs";

// ES Modules で __dirname を再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 読み込み
const gradesPath = path.join(__dirname, "data", "2026_grades_merged.json");
const gradeRacesData = JSON.parse(fs.readFileSync(gradesPath, "utf8"));

// Admin SDK 初期化
admin.initializeApp({
  credential: admin.credential.cert(
    path.join(__dirname, "scraper", "serviceAccountKey.json")
  ),
});

const db = admin.firestore();

// 名前正規化
function normalizeName(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .replace(/（.*?）/g, "")
    .replace(/[Ａ-Ｚａ-ｚ]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
    )
    .replace(/\s+/g, "") // 改行・空白を全部除去
    .replace(/（[^）]+）/g, "")
    .replace(/\([^)]+\)/g, "")
    .replace(/\s+/g, "")
    .replace(/ステークス|S$/g, "")
    .replace(/カップ|C$/g, "")
    .replace(/ジャンプ|J$/g, "")
    .replace(/第\d+回/g, "")
    .toLowerCase()
    .trim();
}

function isSameRace(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

async function main() {
  console.log("🔍 Firestore からレース一覧を取得中...");

  const snapshot = await db.collection("races").get();
  console.log(`📋 ${snapshot.size} 件のレースが見つかりました`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    if (data.name) {
      skipped++;
      continue;
    }

    const matched = gradeRacesData.find(
      (j: any) => j.date === data.date && isSameRace(j.name, data.title)
    );

    if (!matched) {
      notFound++;
      console.log(`⚠️ 対応なし: ${data.date} "${data.title}"`);
      continue;
    }

    await docSnap.ref.update({ name: matched.name });

    updated++;
    console.log(`✅ 更新: "${data.title}" → "${matched.name}"`);
  }

  console.log("\n========== 完了 ==========");
  console.log(`更新: ${updated} 件`);
  console.log(`スキップ: ${skipped} 件`);
  console.log(`対応なし: ${notFound} 件`);
  console.log("===========================");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});