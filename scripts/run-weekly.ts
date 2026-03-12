/**
 * Yahoo! 競馬 週次スクレイピング（月〜木版）
 * 出馬表（今週）＋ 結果（先週）を JSON と Firestore に保存
 *
 * このファイルは「全体の流れ」だけを担当する。
 * 各レースの詳細処理は weekly/ 配下のファイルに委譲している。
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });  // ファイル名を指定
import { fetchWeeklyRacesYahoo } from './scraper/yahoo-scraper/index';
import { fetchLastWeekRacesYahoo } from './scraper/yahoo-scraper/index';

import { processWeeklyRace } from './weekly/processWeeklyRace';
import { processLastWeekRace } from './weekly/processLastWeekRace';

import { generateFolderName, getLatestFolderByType } from './utils/saveRaceData';

import { mergeRaceId } from './mergeRaceId';

import type { RaceListItem, LastWeekRaceItem } from '../types/race';

async function main() {
    console.log('='.repeat(60));
    console.log('Yahoo! 競馬 週次スクレイピング（月〜木版）');
    console.log('='.repeat(60));
    console.log('');

    const folderName = generateFolderName('w');
    console.log(`📁 保存先フォルダ: ${folderName}\n`);

    let thisWeekSuccess = 0;
    let thisWeekError = 0;
    let lastWeekSuccess = 0;
    let lastWeekError = 0;

    // =========================
    // 今週の重賞（出馬表）
    // =========================

    console.log('[1/5] 今週の重賞レース一覧を取得中...');
    const thisWeekRaces = await fetchWeeklyRacesYahoo();
    console.log(`  → ${thisWeekRaces.length} 件のレースを検出\n`);

    console.log('[2/5] 今週の出馬表（予定版）を取得中...');
    console.log('  ⚠️ 結果は取得しません\n');

    for (const race of thisWeekRaces as RaceListItem[]) {
        console.log('-'.repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);
        try {
            await processWeeklyRace(race, folderName);
            thisWeekSuccess++;
        } catch (err) {
            console.error('  ❌ エラー:', err);
            thisWeekError++;
        }
    }

    // =========================
    // 先週の重賞（結果）
    // =========================

    console.log('\n[3/5] 先週の重賞レース一覧を取得中...');
    const lastWeekRaces = await fetchLastWeekRacesYahoo();
    console.log(`  → ${lastWeekRaces.length} 件の先週レースを検出\n`);

    console.log('[4/5] 先週のレース結果を取得中...\n');

    const lastWeekFolder = getLatestFolderByType('w') || folderName;

    for (const race of lastWeekRaces as LastWeekRaceItem[]) {
        console.log('-'.repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);
        try {
            await processLastWeekRace(race, lastWeekFolder);
            lastWeekSuccess++;
        } catch (err) {
            console.error('  ❌ エラー:', err);
            lastWeekError++;
        }
    }

    // =========================
    // サマリー
    // =========================

    console.log('\n' + '='.repeat(60));
    console.log('処理完了');
    console.log('-'.repeat(40));
    console.log(`📁 保存先: ${folderName}`);
    console.log('-'.repeat(40));
    console.log('【今週の重賞】出馬表（予定版）');
    console.log(`  成功: ${thisWeekSuccess} 件`);
    console.log(`  エラー: ${thisWeekError} 件`);
    console.log('-'.repeat(40));
    console.log('【先週の重賞】結果（着順＋払戻金）');
    console.log(`  成功: ${lastWeekSuccess} 件`);
    console.log(`  エラー: ${lastWeekError} 件`);
    console.log('='.repeat(60));

    // raceId マージ
    console.log('\n[6/6] JRA 重賞一覧に raceId をマージ中...');
    await mergeRaceId();

    // Firestore アップロード
    console.log('\n[7/7] Firestore にアップロード中...');
    const { uploadRacesFromJson } = await import("./uploader/uploadRacesFromJson.ts");
    await uploadRacesFromJson();

}

main().catch(console.error);