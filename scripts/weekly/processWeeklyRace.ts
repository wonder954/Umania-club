// scripts/weekly/processWeeklyRace.ts

import { processRaceCommon } from "../common/processRaceCommon";
import { toRegistUrl } from "../common/urlTransform";
import { fetchRaceEntriesRegist } from "../scraper/yahoo-scraper/index";
import merged from "../../scripts/data/2026_grades_merged.json";
import type { RaceListItem } from "../types/raceList";

export async function processWeeklyRace(
    race: RaceListItem,
    folderName: string
) {
    // --- ① merged.json から title / grade を補完（weekly 専用） ---
    const short = merged.find(r => r.id === race.raceId);

    // --- ② processRaceCommon に委譲 ---
    return processRaceCommon({
        race: {
            ...race,
            // regist URL を detailUrl として扱う
            detailUrl: race.detailUrl,
            // merged.json の補完を race 側に反映
            title: short?.name ?? race.title,
            grade: short?.grade ?? race.grade ?? null,
        },
        folderName,

        transformUrlFn: toRegistUrl,
        fetchEntriesFn: fetchRaceEntriesRegist,

        // weekly は「entries が既にあればスキップ」
        skipIfExists: { entries: true },
    });
}