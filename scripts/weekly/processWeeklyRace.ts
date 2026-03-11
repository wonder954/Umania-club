import { fetchRaceEntriesRegist } from '../scraper/yahoo-scraper/index';
import { mergeRaceInfo } from '../utils/mergeRaceInfo';
import { saveRaceData } from '../utils/saveRaceData';
import { saveRaceToFirestore } from '../utils/saveRaceToFirestore';
import type { RaceInfo, RaceListItem, Entry } from '../../types/race';
import merged from "../../scripts/data/2026_grades_merged.json";

/**
 * 今週の重賞レース 1件を処理する
 * - regist ページから出馬表を取得
 * - JSON 保存 → Firestore 保存
 */
export async function processWeeklyRace(
    race: RaceListItem,
    folderName: string
): Promise<void> {
    // レース一覧から取得できる情報でベースの info を作成
    const baseInfo: RaceInfo = {
        date: race.date ?? '',
        place: null,
        title: race.title,
        grade: race.grade ?? null,
        surface: race.surface ?? null,
        distance: race.distance ?? null,
        direction: race.direction ?? null,
        courseDetail: race.courseDetail ?? null,
        weightType: race.weightType ?? null,
        raceNumber: null,
        placeDetail: null,
        videoId: null,
    };

    const short = merged.find(r => r.id === race.raceId);

    // 特別登録ページから出馬表を取得
    const registUrl = race.detailUrl.replace('/race/denma/', '/race/regist/');
    console.log('  📋 出馬表（予定版）を取得中...');
    const { info: registInfo, entries } = await fetchRaceEntriesRegist(registUrl);

    // スクレイプ結果をマージ
    let info = mergeRaceInfo(baseInfo, registInfo);

    // 🔥 ここで短縮名を適用する
    if (short) {
        info.title = short.name;   // ← スプリングS など
        info.grade = short.grade;  // ← G2 / JG2 など
    }


    // JSON 保存（既に entries があればスキップ）
    saveRaceData(
        race.raceId,
        { raceId: race.raceId, info, entries },
        folderName,
        { skipIfExists: { entries: true } }
    );
    console.log(`  ✅ 出馬表保存完了（${entries.length} 頭）`);

    // Firestore 保存
    await saveRaceToFirestore({ raceId: race.raceId, info, entries, result: null });
    console.log('  🔄 Firestore に出馬表を保存しました');
}