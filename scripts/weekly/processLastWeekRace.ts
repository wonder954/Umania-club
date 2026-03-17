// scripts/lastweek/processLastWeekRace.ts

import { processRaceCommon } from "../common/processRaceCommon";
import { toResultUrl } from "../common/urlTransform";
import { fetchRaceResult } from "../scraper/yahoo-scraper/index";

import merged from "../../scripts/data/2026_grades_merged.json";
import { loadRaceData, loadPreviousWeekEntries } from "../utils/saveRaceData";
import type { LastWeekRaceItem } from "../types/raceList";

export async function processLastWeekRace(
    race: LastWeekRaceItem,
    folderName: string
) {
    // --- ① 前週の entries を復元（lastweek 専用処理） ---
    const existingRaceData = loadRaceData(race.raceId, folderName);
    const previousEntries =
        existingRaceData?.entries ??
        loadPreviousWeekEntries(race.raceId) ??
        [];

    // --- ② merged.json から title / grade を補完（lastweek 専用処理） ---
    const short = merged.find(r => r.id === race.raceId);

    // --- ③ processRaceCommon に委譲 ---
    return processRaceCommon({
        race: {
            ...race,
            // lastweek は regist/denma がないので resultUrl を detailUrl として扱う
            detailUrl: race.resultUrl,
            // merged.json の補完を race 側に反映
            title: short?.name ?? race.title,
            grade: short?.grade ?? race.grade ?? null,
        },
        folderName,

        transformUrlFn: toResultUrl,
        fetchEntriesFn: fetchRaceResult,

        skipIfExists: {},

        // lastweek 専用の entries を渡す
        previousEntries,
    });
}