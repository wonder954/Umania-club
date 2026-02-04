/**
 * 月〜木に実行するスクリプト
 * 
 * 処理内容:
 * 1. 今週の重賞一覧を取得（fetchWeeklyRacesYahoo）
 * 2. 今週の出馬表（regist）を保存（結果は保存しない）
 * 3. Yahoo!トップの「前回のレース情報」から先週の重賞一覧を取得
 * 4. 先週の結果（result.order + result.payout）を保存
 * 5. 先週の投稿内容と結果を紐づけてログ表示
 * 6. 成功件数・エラー件数を出力
 * 
 * 保存先:
 * scripts/scraper/data/{yyyymmdd}w/races/{raceId}.json
 * 
 * 実行方法:
 * npx tsx run-weekly.ts
 */

import {
    fetchWeeklyRacesYahoo,
    fetchRaceEntriesRegist,
    fetchLastWeekRacesYahoo,
    fetchRaceResult
} from './yahoo-scraper';
import {
    saveRaceData,
    loadRaceData,
    generateFolderName,
    getLatestFolderByType
} from './utils/saveRaceData';
import type { RaceInfo } from '../../types/race';
import { mergeRaceId } from './mergeRaceId';

// 投稿データの型（仮定義）
interface Prediction {
    author: string;
    honmei?: string;  // 本命馬番号
    comment?: string;
}

/**
 * 投稿データを取得（仮実装）
 * TODO: Firestore または JSON から実際に取得する
 */
async function getPredictions(raceId: string): Promise<Prediction[]> {
    // 仮のダミーデータ（後で実装を差し替え）
    console.log(`  📝 投稿データ取得中（raceId: ${raceId}）...`);
    return [];
}

async function main() {
    console.log('='.repeat(60));
    console.log('Yahoo! 競馬 週次スクレイピング（月〜木版）');
    console.log('='.repeat(60));
    console.log('');

    // 今日の日付でフォルダ名を生成
    const folderName = generateFolderName('w');
    console.log(`📁 保存先フォルダ: ${folderName}`);
    console.log('');

    let thisWeekSuccess = 0;
    let thisWeekError = 0;
    let lastWeekSuccess = 0;
    let lastWeekError = 0;

    // ==================================================
    // 【今週の重賞】出馬表（予定版）のみ取得
    // ==================================================
    console.log('[1/5] 今週の重賞レース一覧を取得中...');
    const thisWeekRaces = await fetchWeeklyRacesYahoo();
    console.log(`  → ${thisWeekRaces.length} 件のレースを検出`);
    console.log('');

    console.log('[2/5] 今週の出馬表（予定版）を取得中...');
    console.log('  ⚠️ 結果は取得しません');
    console.log('');

    for (const race of thisWeekRaces) {
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

            // regist ページに変換
            const registUrl = race.detailUrl.replace('/race/denma/', '/race/regist/');
            console.log(`  📋 出馬表（予定版）を取得中...`);

            const { info: registInfo, entries } = await fetchRaceEntriesRegist(registUrl);

            // info をマージ
            if (registInfo.date) info.date = registInfo.date;
            if (registInfo.place) info.place = registInfo.place;
            if (registInfo.placeDetail) info.placeDetail = registInfo.placeDetail;
            if (registInfo.raceNumber) info.raceNumber = registInfo.raceNumber;

            // フォルダ指定で保存（既存 entries があればスキップ）
            saveRaceData(race.raceId, {
                raceId: race.raceId,
                info,
                entries,
            }, folderName, {
                skipIfExists: { entries: true },
            });

            console.log(`  ✅ 出馬表保存完了（${entries.length} 頭）`);
            thisWeekSuccess++;

        } catch (error) {
            console.error(`  ❌ エラー:`, error);
            thisWeekError++;
            continue;
        }
    }

    // ==================================================
    // 【先週の重賞】結果（着順＋払戻金）を取得
    // ==================================================
    console.log('');
    console.log('[3/5] 先週の重賞レース一覧を取得中（前回のレース情報）...');
    const lastWeekRaces = await fetchLastWeekRacesYahoo();
    console.log(`  → ${lastWeekRaces.length} 件の先週レースを検出`);
    console.log('');

    console.log('[4/5] 先週のレース結果を取得中...');
    console.log('');

    // 先週のフォルダを取得（もし存在すれば）
    const lastWeekFolder = getLatestFolderByType('w');

    for (const race of lastWeekRaces) {
        console.log('-'.repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);

        try {
            console.log(`  🏆 レース結果を取得中...`);
            const { info, result } = await fetchRaceResult(race.resultUrl);

            if (result.order.length > 0) {
                // 先週のフォルダに結果を保存（なければ今週フォルダに保存）
                const targetFolder = lastWeekFolder || folderName;

                saveRaceData(race.raceId, {
                    raceId: race.raceId,
                    info: {
                        date: info.date || '',
                        place: info.place || '',
                        title: race.title,
                        grade: race.grade,
                        raceNumber: info.raceNumber,
                        placeDetail: info.placeDetail,
                        distance: info.distance,        // ✅ 追加
                        surface: info.surface,          // ✅ 追加
                        direction: info.direction,      // ✅ 追加
                        courseDetail: info.courseDetail, // ✅ 追加（念のため）
                        weightType: info.weightType,    // ✅ 追加（念のため）
                    },
                    result,
                }, targetFolder);

                console.log(`  ✅ 結果保存完了（フォルダ: ${targetFolder}）`);
                console.log(`     着順: ${result.order.length} 着`);
                console.log(`     払戻: ${Object.keys(result.payout).filter(k => (result.payout as any)[k]?.length > 0).length} 券種`);
                lastWeekSuccess++;
            } else {
                console.log(`  ⚠️ 結果データなし`);
                lastWeekError++;
            }

        } catch (error) {
            console.error(`  ❌ エラー:`, error);
            lastWeekError++;
            continue;
        }
    }

    // ==================================================
    // 【先週の投稿と結果の紐づけ】
    // ==================================================
    console.log('');
    console.log('[5/5] 先週の投稿内容と結果を紐づけ中...');
    console.log('');

    for (const race of lastWeekRaces) {
        console.log('-'.repeat(40));
        console.log(`[${race.raceId}] ${race.title} (${race.grade})`);

        try {
            // 先週のレースデータを読み込み
            const raceData = loadRaceData(race.raceId, lastWeekFolder || folderName);
            if (!raceData?.result?.order) {
                console.log(`  ⚠️ 結果データなし`);
                continue;
            }

            // 投稿データを取得
            const predictions = await getPredictions(race.raceId);

            if (predictions.length === 0) {
                console.log(`  📝 投稿なし`);
                continue;
            }

            // 1着の馬を特定
            const winner = raceData.result.order.find((o: any) => o.rank === 1);
            const winnerNumber = winner?.number?.toString();

            // 投稿と結果を紐づけて表示
            for (const pred of predictions) {
                const honmeiNumber = pred.honmei;
                const isHit = honmeiNumber && winnerNumber && honmeiNumber === winnerNumber;

                console.log(`  投稿者: ${pred.author} → 本命 ${honmeiNumber || '未設定'}`);
                if (winner) {
                    console.log(`  結果: ${winnerNumber} (${winner.name}) が 1着`);
                }
                if (isHit) {
                    console.log(`  🎯 的中！`);
                }
            }

        } catch (error) {
            console.error(`  ❌ エラー:`, error);
            continue;
        }
    }

    // ==================================================
    // サマリー
    // ==================================================
    console.log('');
    console.log('='.repeat(60));
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

    // ==================================================
    // 【raceId マージ処理】
    // ==================================================

    console.log('');
    console.log('[6/6] JRA 重賞一覧に raceId をマージ中...');
    await mergeRaceId();
}

main().catch(console.error);