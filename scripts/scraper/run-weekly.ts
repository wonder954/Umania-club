/**
 * Yahoo! 競馬 週次スクレイピング（月〜木版）
 * 出馬表（今週）＋結果（先週）を JSON と Firestore に保存
 */

import {
    fetchWeeklyRacesYahoo,
    fetchRaceEntriesRegist,
    fetchLastWeekRacesYahoo,
    fetchRaceResult
} from "./yahoo-scraper";

import {
    saveRaceData,
    loadRaceData,
    generateFolderName,
    getLatestFolderByType
} from "./utils/saveRaceData";

import type {
    RaceInfo,
    RaceListItem,
    LastWeekRaceItem
} from "../../types/race";

import { mergeRaceId } from "./mergeRaceId";

import { adminDb } from "./firebase-admin";


// 投稿データ（仮）
interface Prediction {
    author: string;
    honmei?: string;
    comment?: string;
}

async function getPredictions(raceId: string): Promise<Prediction[]> {
    console.log(`  📝 投稿データ取得中（raceId: ${raceId}）...`);
    return [];
}

// Firestore 保存関数
async function saveRaceToFirestore(race: any) {
    await adminDb
        .collection("races")
        .doc(race.id)
        .set(race, { merge: true });
}


async function main() {
    console.log("=".repeat(60));
    console.log("Yahoo! 競馬 週次スクレイピング（月〜木版）");
    console.log("=".repeat(60));
    console.log("");

    const folderName = generateFolderName("w");
    console.log(`📁 保存先フォルダ: ${folderName}\n`);

    let thisWeekSuccess = 0;
    let thisWeekError = 0;
    let lastWeekSuccess = 0;
    let lastWeekError = 0;

    // =========================
    // 今週の重賞（出馬表）
    // =========================
    console.log("[1/5] 今週の重賞レース一覧を取得中...");
    const thisWeekRaces = await fetchWeeklyRacesYahoo();
    console.log(`  → ${thisWeekRaces.length} 件のレースを検出\n`);

    console.log("[2/5] 今週の出馬表（予定版）を取得中...");
    console.log("  ⚠️ 結果は取得しません\n");

    for (const race of thisWeekRaces as RaceListItem[]) {
        console.log("-".repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);

        try {
            // RaceInfo 初期化
            const info: RaceInfo = {
                date: race.date ?? "",
                place: null,
                title: race.title,
                grade: race.grade ?? null,
                surface: race.surface ?? null,
                distance: race.distance ?? null,
                direction: race.direction ?? null,
                courseDetail: race.courseDetail ?? null,
                weightType: race.weightType ?? null,
                raceNumber: null,
                placeDetail: null
            };

            // regist ページへ変換
            const registUrl = race.detailUrl.replace("/race/denma/", "/race/regist/");
            console.log("  📋 出馬表（予定版）を取得中...");

            const { info: registInfo, entries } = await fetchRaceEntriesRegist(registUrl);

            // regist 情報をマージ
            info.date = registInfo.date ?? info.date;
            info.place = registInfo.place ?? null;
            info.placeDetail = registInfo.placeDetail ?? null;
            info.raceNumber = registInfo.raceNumber ?? null;
            info.distance = registInfo.distance?.replace("m", "") ?? null;

            // JSON 保存
            saveRaceData(
                race.raceId,
                { raceId: race.raceId, info, entries },
                folderName,
                { skipIfExists: { entries: true } }
            );

            console.log(`  ✅ 出馬表保存完了（${entries.length} 頭）`);
            thisWeekSuccess++;

            const data = {
                id: race.raceId,
                name: info.title ?? null,
                date: info.date ?? null,
                place: info.place ?? null,
                raceNumber: info.raceNumber ?? null,
                grade: info.grade ?? null,
                placeDetail: info.placeDetail ?? null,
                course: {
                    surface: info.surface ?? null,
                    distance: info.distance ? Number(info.distance) : null,
                    direction: info.direction ?? null,
                    courseDetail: info.courseDetail ?? null
                },
                weightType: info.weightType ?? null,
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

            // 🔥 undefined が含まれていないか確認
            console.log("Firestore保存データ:", JSON.stringify(data, null, 2));

            // Firestore 保存
            await saveRaceToFirestore({
                id: race.raceId,
                name: info.title,
                date: info.date,
                place: info.place ?? null,
                raceNumber: info.raceNumber ?? null,
                grade: info.grade ?? null,
                placeDetail: info.placeDetail ?? null,
                course: {
                    surface: info.surface ?? null,
                    distance: info.distance ? Number(info.distance) : null,
                    direction: info.direction ?? null,
                    courseDetail: info.courseDetail ?? null
                },
                weightType: info.weightType ?? null,
                horses: entries.map(e => ({
                    frame: e.frame ?? null,
                    number: e.number ?? null,
                    name: e.name,
                    jockey: e.jockey ?? null,
                    weight: e.weight ?? null,
                    odds: e.odds ?? null,
                    popular: e.popular ?? null
                })),
                result: null
            });

            console.log("  🔄 Firestore に出馬表を保存しました");

        } catch (err) {
            console.error("  ❌ エラー:", err);
            thisWeekError++;
        }
    }

    // =========================
    // 先週の重賞（結果）
    // =========================
    console.log("\n[3/5] 先週の重賞レース一覧を取得中...");
    const lastWeekRaces = await fetchLastWeekRacesYahoo();
    console.log(`  → ${lastWeekRaces.length} 件の先週レースを検出\n`);

    console.log("[4/5] 先週のレース結果を取得中...\n");

    const lastWeekFolder = getLatestFolderByType("w");

    for (const race of lastWeekRaces as LastWeekRaceItem[]) {
        console.log("-".repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);

        try {
            const { info, result } = await fetchRaceResult(race.resultUrl);

            if (!result?.order?.length) {
                console.log("  ⚠️ 結果データなし");
                lastWeekError++;
                continue;
            }

            const targetFolder = lastWeekFolder || folderName;

            // JSON 保存
            saveRaceData(
                race.raceId,
                {
                    raceId: race.raceId,
                    info: {
                        date: info.date ?? "",
                        place: info.place ?? "",
                        title: race.title,
                        grade: race.grade ?? null,
                        raceNumber: info.raceNumber ?? null,
                        placeDetail: info.placeDetail ?? null,
                        distance: info.distance ?? null,
                        surface: info.surface ?? null,
                        direction: info.direction ?? null,
                        courseDetail: info.courseDetail ?? null,
                        weightType: info.weightType ?? null
                    },
                    result
                },
                targetFolder
            );

            console.log(`  ✅ 結果保存完了（フォルダ: ${targetFolder}）`);

            // Firestore 保存用 raceData を読み込み
            const raceData = loadRaceData(race.raceId, targetFolder);
            if (!raceData) {
                console.log("  ⚠️ Firestore 保存スキップ（raceData が null）");
                continue;
            }

            await saveRaceToFirestore({
                id: race.raceId,
                name: raceData.info.title,
                date: raceData.info.date,
                place: raceData.info.place,
                raceNumber: raceData.info.raceNumber,
                grade: raceData.info.grade,
                placeDetail: raceData.info.placeDetail,
                course: {
                    surface: raceData.info.surface,
                    distance: raceData.info.distance ? Number(raceData.info.distance) : null,
                    direction: raceData.info.direction,
                    courseDetail: raceData.info.courseDetail
                },
                weightType: raceData.info.weightType,
                horses: raceData.entries?.map(e => ({
                    frame: e.frame,
                    number: e.number,
                    name: e.name,
                    jockey: e.jockey ?? null,
                    weight: e.weight ?? null,
                    odds: e.odds ?? null,
                    popular: e.popular ?? null
                })) ?? [],
                result: raceData.result ?? null
            });

            console.log("  🔄 Firestore に結果を保存しました");
            lastWeekSuccess++;

        } catch (err) {
            console.error("  ❌ エラー:", err);
            lastWeekError++;
        }
    }

    // =========================
    // サマリー
    // =========================
    console.log("\n" + "=".repeat(60));
    console.log("処理完了");
    console.log("-".repeat(40));
    console.log(`📁 保存先: ${folderName}`);
    console.log("-".repeat(40));
    console.log("【今週の重賞】出馬表（予定版）");
    console.log(`  成功: ${thisWeekSuccess} 件`);
    console.log(`  エラー: ${thisWeekError} 件`);
    console.log("-".repeat(40));
    console.log("【先週の重賞】結果（着順＋払戻金）");
    console.log(`  成功: ${lastWeekSuccess} 件`);
    console.log(`  エラー: ${lastWeekError} 件`);
    console.log("=".repeat(60));

    // raceId マージ
    console.log("\n[6/6] JRA 重賞一覧に raceId をマージ中...");
    await mergeRaceId();
}

main().catch(console.error);