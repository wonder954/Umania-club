// scripts/friday/processFridayRace.ts

import { processRaceCommon } from "../common/processRaceCommon";
import { toDenmaUrl } from "../common/urlTransform";
import { fetchRaceEntriesDenma } from "../scraper/yahoo-scraper/index";
import merged from "../../scripts/data/2026_grades_merged.json";
import type { RaceListItem } from "../types/raceList";

export async function processFridayRace(
    race: RaceListItem,
    folderName: string
) {
    // --- ① merged.json から title / grade を補完（friday 専用） ---
    const short = merged.find(r => r.id === race.raceId);

    // --- ② processRaceCommon に委譲 ---
    return processRaceCommon({
        race: {
            ...race,
            // denma URL を detailUrl として扱う
            detailUrl: race.detailUrl,
            // merged.json の補完を race 側に反映
            title: short?.name ?? race.title,
            grade: short?.grade ?? race.grade ?? null,
        },
        folderName,

        transformUrlFn: toDenmaUrl,
        fetchEntriesFn: fetchRaceEntriesDenma,

        // friday は「結果が既にあればスキップ」
        skipIfExists: { result: true },
    });
}