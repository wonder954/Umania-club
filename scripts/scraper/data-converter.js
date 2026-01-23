/**
 * Yahoo!競馬スクレイパーのデータを既存のRace型に変換するユーティリティ
 */

/**
 * レースIDをURLから抽出
 */
export function extractRaceIdFromUrl(url) {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? match[1] : '';
}

/**
 * 日本語の日付を YYYY-MM-DD 形式に変換
 * 例: "2026年1月25日（日）" → "2026-01-25"
 */
export function parseJapaneseDate(dateStr) {
    if (!dateStr) {
        console.warn(`parseJapaneseDate: dateStr is null`);
        return '';
    }

    const match = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
    if (!match) {
        console.warn(`Failed to parse date: ${dateStr}`);
        return '';
    }

    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Yahoo!競馬のレースデータを既存のRace型に変換
 */
export function convertYahooRaceToRace(yahooRace, horses) {
    const raceId = extractRaceIdFromUrl(yahooRace.detailUrl);

    return {
        id: raceId,
        name: yahooRace.title,
        date: parseJapaneseDate(yahooRace.date),

        // ★ turfText はもう存在しないので削除
        // course は「競馬場名」ではなく「コース情報（芝・右・外など）」に変更
        course: {
            surface: yahooRace.surface ?? null,
            direction: yahooRace.direction ?? null,
            courseDetail: yahooRace.courseDetail ?? null,
            distance: yahooRace.distance ?? null,
        },

        grade: yahooRace.grade,
        distance: yahooRace.distance ?? null,
        track: yahooRace.surface ?? null,
        weightType: yahooRace.weightType ?? null,

        horses: horses.map(horse => ({
            number: horse.number,
            name: horse.name,
            jockey: horse.jockey,
            frame: horse.frame,
            weight: horse.weight,
        })),

        result: null
    };
}

/**
 * 複数レースをまとめて Race 型に変換
 */
export function convertToRacesObject(racesWithHorses) {
    const racesObj = {};

    racesWithHorses.forEach(({ yahooRace, horses }) => {
        const race = convertYahooRaceToRace(yahooRace, horses);
        racesObj[race.id] = race;
    });

    return racesObj;
}