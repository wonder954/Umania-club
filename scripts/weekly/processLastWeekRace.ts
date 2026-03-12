import { fetchRaceResult } from '../scraper/yahoo-scraper/index';
import { normalizeDistance } from '../utils/normalize';
import { saveRaceData, loadRaceData, loadPreviousWeekEntries } from '../utils/saveRaceData';
import type { RaceInfo, LastWeekRaceItem } from '../../types/race';

import merged from "../../scripts/data/2026_grades_merged.json";
import { searchJraOfficialVideo } from "../../lib/searchJraOfficialVideo"; // ← 追加

export async function processLastWeekRace(
    race: LastWeekRaceItem,
    targetFolder: string
): Promise<void> {

    const { info, result } = await fetchRaceResult(race.resultUrl);

    if (!result?.order?.length) {
        console.log('  ⚠️ 結果データなし');
        return;
    }

    // 🔥 短縮名を取得
    const short = merged.find(r => r.id === race.raceId);

    // 既存の出馬表エントリを優先
    const existingRaceData = loadRaceData(race.raceId, targetFolder);
    const previousEntries =
        existingRaceData?.entries ??
        loadPreviousWeekEntries(race.raceId) ??
        [];

    // 🔥 YouTube 検索クエリを作成
    const year = info.date?.slice(0, 4) ?? "";
    const raceName = short?.name ?? race.title;
    const query = `${year} ${raceName} JRA公式`;

    console.log(`  🎥 YouTube検索: ${query}`);

    // 🔥 YouTube から videoId を取得
    const video = await searchJraOfficialVideo(query);

    // 🔥 Yahoo の長い名前ではなく短縮名を優先
    const mergedInfo: RaceInfo = {
        date: info.date ?? '',
        place: info.place ?? '',
        title: raceName,
        grade: short?.grade ?? race.grade ?? null,
        raceNumber: info.raceNumber ?? null,
        placeDetail: info.placeDetail ?? null,
        distance: normalizeDistance(info.distance),
        surface: info.surface ?? null,
        direction: info.direction ?? null,
        courseDetail: info.courseDetail ?? null,
        weightType: info.weightType ?? null,

        // 🔥 追加：YouTube videoId
        videoId: video?.videoId ?? null,
    };

    // JSON 保存
    saveRaceData(
        race.raceId,
        { raceId: race.raceId, info: mergedInfo, entries: previousEntries, result },
        targetFolder
    );
    console.log(`  ✅ 結果保存完了（フォルダ: ${targetFolder}）`);
}