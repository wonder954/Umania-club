// Yahoo! 競馬 金曜スクレイピング（確定出馬表版）

import { fetchWeeklyRacesYahoo, fetchRaceEntriesDenma } from "./yahoo-scraper";
import { saveRaceData, generateFolderName } from "./utils/saveRaceData";
import type { RaceInfo } from "../../types/race";
import { adminDb } from "./firebase-admin";
import { cleanTitle, createSearchKey } from "@/utils/race";

async function saveRaceToFirestore(race: any) {
    await adminDb.collection("races").doc(race.id).set(race, { merge: true });
}

async function main() {
    console.log("=".repeat(60));
    console.log("Yahoo! 競馬 金曜スクレイピング（確定出馬表版）");
    console.log("=".repeat(60));
    console.log("");

    const folderName = generateFolderName("f");
    console.log(`📁 保存先フォルダ: ${folderName}\n`);

    console.log("[1/2] 重賞レース一覧を取得中...");
    const races = await fetchWeeklyRacesYahoo();
    console.log(`  → ${races.length} 件のレースを検出\n`);

    let successCount = 0;
    let errorCount = 0;

    console.log("[2/2] 確定出馬表を取得中...\n");

    for (const race of races) {
        console.log("-".repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);

        try {
            // 一覧ページの情報を初期値にする（weekly と統一）
            const info: RaceInfo = {
                date: race.date ?? "",
                place: null,
                title: race.title,
                grade: race.grade ?? null,
                surface: race.surface ?? null,
                distance: race.distance ?? null, // number | null
                direction: race.direction ?? null,
                courseDetail: race.courseDetail ?? null,
                weightType: race.weightType ?? null,
                raceNumber: null,
                placeDetail: null
            };

            const denmaUrl = race.detailUrl.includes("/race/denma/")
                ? race.detailUrl
                : race.detailUrl.replace("/race/index/", "/race/denma/");

            console.log("  📋 出馬表（確定版）を取得中...");
            const { info: denmaInfo, entries } = await fetchRaceEntriesDenma(denmaUrl);

            // denma 情報をマージ（weekly と同じ戦略）
            info.date = denmaInfo.date ?? info.date;
            info.place = denmaInfo.place ?? info.place;
            info.placeDetail = denmaInfo.placeDetail ?? info.placeDetail;
            info.raceNumber = denmaInfo.raceNumber ?? info.raceNumber;

            if (denmaInfo.surface) info.surface = denmaInfo.surface;
            if (denmaInfo.direction) info.direction = denmaInfo.direction;
            if (denmaInfo.courseDetail) info.courseDetail = denmaInfo.courseDetail;
            if (denmaInfo.weightType) info.weightType = denmaInfo.weightType;

            if (denmaInfo.distance !== null && denmaInfo.distance !== undefined) {
                info.distance = denmaInfo.distance; // number
            }

            // JSON 保存（entries は上書き、result は保持）
            saveRaceData(
                race.raceId,
                { raceId: race.raceId, info, entries },
                folderName,
                { skipIfExists: { result: true } }
            );

            console.log(`  ✅ 出馬表保存完了（${entries.length} 頭）`);

            const hasNumbers = entries.some(e => e.number !== null);
            console.log(hasNumbers ? "  📌 馬番確定済み" : "  ⚠️ 馬番未確定");

            // Firestore 保存（weekly と完全統一）
            const firestoreData = {
                id: race.raceId,
                name: cleanTitle(info.title),
                date: info.date,
                year: Number(info.date.slice(0, 4)),
                searchKey: createSearchKey(info.date, info.title),
                place: info.place,
                raceNumber: info.raceNumber,
                grade: info.grade,
                placeDetail: info.placeDetail,
                course: {
                    surface: info.surface,
                    distance: info.distance, // number
                    direction: info.direction,
                    courseDetail: info.courseDetail
                },
                weightType: info.weightType,
                horses: entries.map(e => ({
                    frame: e.frame ?? null,
                    number: e.number ?? null,
                    name: e.name ?? null,
                    jockey: e.jockey ?? null,
                    weight: e.weight ?? null,
                    odds: e.odds ?? null,
                    popular: e.popular ?? null
                })),
                result: null
            };

            console.log("  Firestore保存データ:", JSON.stringify(firestoreData, null, 2));

            await saveRaceToFirestore(firestoreData);
            console.log("  🔄 Firestore に出馬表を保存しました");

            successCount++;

        } catch (error) {
            console.error("  ❌ エラー:", error);
            errorCount++;
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("処理完了");
    console.log("-".repeat(40));
    console.log(`📁 保存先: ${folderName}`);
    console.log(`  成功: ${successCount} 件`);
    console.log(`  エラー: ${errorCount} 件`);
    console.log("=".repeat(60));
}

main().catch(console.error);