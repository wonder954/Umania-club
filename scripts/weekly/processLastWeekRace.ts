import { fetchRaceResult } from '../scraper/yahoo-scraper/index';
import { normalizeDistance } from '../utils/normalize';
import { saveRaceData, loadRaceData, loadPreviousWeekEntries } from '../utils/saveRaceData';
import { saveRaceToFirestore } from '../utils/saveRaceToFirestore';
import type { RaceInfo, LastWeekRaceItem } from '../../types/race';

/**
 * 先週の重賞レース 1件を処理する
 * - result ページから着順・払戻金を取得
 * - JSON 保存 → Firestore 保存
 */
export async function processLastWeekRace(
    race: LastWeekRaceItem,
    targetFolder: string
): Promise<void> {
    const { info, result } = await fetchRaceResult(race.resultUrl);

    if (!result?.order?.length) {
        console.log('  ⚠️ 結果データなし');
        return;
    }

    // 既存の出馬表エントリを優先して使う（馬番あり情報を引き継ぐため）
    const existingRaceData = loadRaceData(race.raceId, targetFolder);
    const previousEntries =
        existingRaceData?.entries ??
        loadPreviousWeekEntries(race.raceId) ??
        [];

    const mergedInfo: RaceInfo = {
        date: info.date ?? '',
        place: info.place ?? '',
        title: race.title,
        grade: race.grade ?? null,
        raceNumber: info.raceNumber ?? null,
        placeDetail: info.placeDetail ?? null,
        distance: normalizeDistance(info.distance),
        surface: info.surface ?? null,
        direction: info.direction ?? null,
        courseDetail: info.courseDetail ?? null,
        weightType: info.weightType ?? null,
    };

    // JSON 保存
    saveRaceData(
        race.raceId,
        { raceId: race.raceId, info: mergedInfo, entries: previousEntries, result },
        targetFolder
    );
    console.log(`  ✅ 結果保存完了（フォルダ: ${targetFolder}）`);

    // Firestore 保存（保存後のデータを再ロードして使う）
    const updatedRaceData = loadRaceData(race.raceId, targetFolder);
    if (!updatedRaceData) {
        console.log('  ⚠️ Firestore 保存スキップ（raceData が null）');
        return;
    }

    await saveRaceToFirestore({
        raceId: race.raceId,
        info: updatedRaceData.info,
        entries: updatedRaceData.entries ?? [],
        result: updatedRaceData.result ?? null,
    });
    console.log('  🔄 Firestore に結果を保存しました');
}