console.log('✅ mergeRaceInfo.ts が読み込まれました');


import type { RaceInfo } from '../../lib/race/info';

/**
 * スクレイプしたレース情報を既存の info にマージする
 * regist / denma どちらの結果にも使える共通処理
 */
export function mergeRaceInfo(
    base: RaceInfo,
    scraped: Partial<RaceInfo>
): RaceInfo {
    return {
        ...base,
        date: scraped.date ?? base.date,
        place: scraped.place ?? base.place,
        placeDetail: scraped.placeDetail ?? base.placeDetail,
        raceNumber: scraped.raceNumber ?? base.raceNumber,
        // distance は 0 や null を「未取得」とみなして base を優先しない
        distance:
            scraped.distance !== null && scraped.distance !== undefined
                ? scraped.distance
                : base.distance,
        surface: scraped.surface ?? base.surface,
        direction: scraped.direction ?? base.direction,
        courseDetail: scraped.courseDetail ?? base.courseDetail,
        weightType: scraped.weightType ?? base.weightType,
    };
}