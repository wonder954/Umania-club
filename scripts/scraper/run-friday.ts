/**
 * 金曜に実行するスクリプト
 * 
 * 処理内容:
 * 1. 重賞レース一覧を取得
 * 2. 各レースについて:
 *    - denma ページから出馬表（馬番あり）を取得して上書き保存
 *    - result は既存を保持
 * 
 * 保存先:
 * scripts/scraper/data/{yyyymmdd}f/races/{raceId}.json
 * ＋ Firestore の races コレクション
 * 
 * 実行方法:
 * npx tsx run-friday.ts
 */

import { fetchWeeklyRacesYahoo, fetchRaceEntriesDenma } from './yahoo-scraper';
import { saveRaceData, generateFolderName } from './utils/saveRaceData';
import type { RaceInfo } from '../../types/race';

import { adminDb } from './firebase-admin';

// Firestore 保存関数（weekly と同じ）
async function saveRaceToFirestore(race: any) {
    await adminDb
        .collection('races')
        .doc(race.id)
        .set(race, { merge: true });
}

async function main() {
    console.log('='.repeat(60));
    console.log('Yahoo! 競馬 金曜スクレイピング（確定出馬表版）');
    console.log('='.repeat(60));
    console.log('');

    // 今日の日付でフォルダ名を生成
    const folderName = generateFolderName('f');
    console.log(`📁 保存先フォルダ: ${folderName}`);
    console.log('');

    // 1. 重賞一覧を取得
    console.log('[1/2] 重賞レース一覧を取得中...');
    const races = await fetchWeeklyRacesYahoo();
    console.log(`  → ${races.length} 件のレースを検出`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // 2. 各レースを処理
    console.log('[2/2] 確定出馬表を取得中...');
    console.log('');

    for (const race of races) {
        console.log('-'.repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);

        try {
            // レース情報を構築
            const info: RaceInfo = {
                date: race.date || '',
                place: '',
                title: race.title,
                grade: race.grade,
                surface: race.surface || undefined,
                distance: race.distance || undefined,
                direction: race.direction || undefined,
                courseDetail: race.courseDetail || undefined,
                weightType: race.weightType || undefined,
            };

            // denma ページから出馬表（確定版）を取得
            const denmaUrl = race.detailUrl.includes('/race/denma/')
                ? race.detailUrl
                : race.detailUrl.replace('/race/index/', '/race/denma/');

            console.log(`  📋 出馬表（確定版）を取得中...`);

            const { info: denmaInfo, entries } = await fetchRaceEntriesDenma(denmaUrl);

            // info をマージ
            if (denmaInfo.date) info.date = denmaInfo.date;
            if (denmaInfo.place) info.place = denmaInfo.place;
            if (denmaInfo.placeDetail) info.placeDetail = denmaInfo.placeDetail;
            if (denmaInfo.raceNumber) info.raceNumber = denmaInfo.raceNumber;

            // JSON 保存（entries は上書き、result は既存を保持）
            saveRaceData(race.raceId, {
                raceId: race.raceId,
                info,
                entries,
            }, folderName, {
                skipIfExists: { result: true },
            });

            console.log(`  ✅ 出馬表保存完了（${entries.length} 頭）`);

            // 馬番の有無をチェック
            const hasNumbers = entries.some(e => e.number !== null);
            if (hasNumbers) {
                console.log(`  📌 馬番確定済み`);
            } else {
                console.log(`  ⚠️ 馬番未確定（枠順抽選前）`);
            }

            // 🔥 Firestore に保存
            const firestoreData = {
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

            console.log('  Firestore保存データ:', JSON.stringify(firestoreData, null, 2));

            await saveRaceToFirestore(firestoreData);
            console.log('  🔄 Firestore に出馬表を保存しました');

            successCount++;

        } catch (error) {
            console.error(`  ❌ エラー:`, error);
            errorCount++;
            continue;
        }
    }

    // 3. サマリー
    console.log('');
    console.log('='.repeat(60));
    console.log('処理完了');
    console.log('-'.repeat(40));
    console.log(`📁 保存先: ${folderName}`);
    console.log('-'.repeat(40));
    console.log(`  成功: ${successCount} 件`);
    console.log(`  エラー: ${errorCount} 件`);
    console.log('='.repeat(60));
}

main().catch(console.error);