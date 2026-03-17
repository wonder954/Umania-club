// scripts/common/processRaceCommon.ts

import type { RaceInfo, RaceData } from "../../lib/race/info";
import { createInitialInfo } from "../friday/createInitialInfo";
import { mergeRaceInfo } from "../utils/mergeRaceInfo";
import { saveRaceData } from "../utils/saveRaceData";
import { normalizeRace } from "../../lib/race/normalize";
import { saveRace } from "../firebase/saveRace";
import { searchJraOfficialVideo } from "../../lib/searchJraOfficialVideo";

export async function processRaceCommon(config: {
    race: any;
    folderName: string;

    transformUrlFn: (url: string) => string;
    fetchEntriesFn: (url: string) => Promise<{
        info: Partial<RaceInfo>;
        entries?: any[];
        result?: any;
    }>;
    skipIfExists: any;

    // lastweek 専用（weekly / friday は undefined のままで OK）
    previousEntries?: any[];
}) {
    const {
        race,
        folderName,
        transformUrlFn,
        fetchEntriesFn,
        skipIfExists,
        previousEntries = [],
    } = config;

    console.log(`\n--- ${race.raceId} ${race.title} (${race.grade}) ---`);

    // ① 初期 info を作る
    const info: RaceInfo = createInitialInfo(race);

    // ② URL を変換（regist / denma / result）
    const url = transformUrlFn(race.detailUrl);
    console.log(`  🌐 Fetching: ${url}`);

    // ③ スクレイピング（出馬表 or 結果）
    const scraped = await fetchEntriesFn(url);

    // ④ 結果がないレースはスキップ
    if (scraped.result && !scraped.result.order?.length) {
        console.log("  ⚠️ 結果データなし → スキップ");
        return;
    }

    // ⑤ info をマージ
    const mergedInfo = mergeRaceInfo(info, scraped.info);

    // ⑥ YouTube 動画検索（共通化）
    const year = mergedInfo.date?.slice(0, 4) ?? "";
    const query = `${year} ${mergedInfo.title} JRA公式`;
    const video = await searchJraOfficialVideo(query);

    mergedInfo.videoId = video?.videoId ?? mergedInfo.videoId ?? null;

    // ⑦ entries の決定（weekly/friday は scraped.entries、lastweek は previousEntries）
    const finalEntries = scraped.entries ?? previousEntries;

    // ⑧ RaceData を組み立てる
    const raceData: RaceData = {
        raceId: race.raceId,
        info: mergedInfo,
        entries: finalEntries,
        result: scraped.result,
    };

    // ⑨ JSON 保存
    saveRaceData(race.raceId, raceData, folderName, skipIfExists);
    console.log(`  💾 JSON 保存完了`);

    // ⑩ FirestoreRace に正規化
    const normalized = normalizeRace(raceData);

    // ⑪ Firestore 保存
    await saveRace(normalized);
    console.log(`  🔥 Firestore 保存完了`);
}