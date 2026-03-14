// scripts/friday/processFridayRace.ts
import type { RaceInfo } from "../../types/race";
import { createInitialInfo } from "./createInitialInfo";
import { fetchRaceEntriesDenma } from "../scraper/yahoo-scraper/index";
import { saveRaceData } from "../utils/saveRaceData";

export async function processFridayRace(race: any, folderName: string) {
    console.log(`\n--- ${race.raceId} ${race.title} (${race.grade}) ---`);

    // ① 初期 info（weekly と同じ）
    const info: RaceInfo = createInitialInfo(race);

    // ② denma URL に変換
    const denmaUrl = race.detailUrl.includes("/race/denma/")
        ? race.detailUrl
        : race.detailUrl.replace("/race/index/", "/race/denma/");

    console.log("  📋 出馬表（確定版）を取得中...");
    const { info: denmaInfo, entries } = await fetchRaceEntriesDenma(denmaUrl);

    // ③ denma 情報をマージ（weekly と同じ戦略）
    info.date = denmaInfo.date ?? info.date;
    info.place = denmaInfo.place ?? info.place;
    info.placeDetail = denmaInfo.placeDetail ?? info.placeDetail;
    info.raceNumber = denmaInfo.raceNumber ?? info.raceNumber;

    if (denmaInfo.surface) info.surface = denmaInfo.surface;
    if (denmaInfo.direction) info.direction = denmaInfo.direction;
    if (denmaInfo.courseDetail) info.courseDetail = denmaInfo.courseDetail;
    if (denmaInfo.weightType) info.weightType = denmaInfo.weightType;

    if (denmaInfo.distance !== null && denmaInfo.distance !== undefined) {
        info.distance = denmaInfo.distance;
    }

    // ④ JSON 保存（entries は上書き、result は保持）
    saveRaceData(
        race.raceId,
        { raceId: race.raceId, info, entries },
        folderName,
        { skipIfExists: { result: true } }
    );

    console.log(`  ✅ 出馬表保存完了（${entries.length} 頭）`);
}