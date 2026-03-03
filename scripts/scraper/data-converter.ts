// scripts/scraper/utils/data-converter.ts

/**
 * レースIDをURLから抽出
 */
export function extractRaceIdFromUrl(url: string): string {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? match[1] : "";
}

/**
 * 日本語の日付を YYYY-MM-DD 形式に変換
 * 例: "2026年1月25日（日）" → "2026-01-25"
 */
export function parseJapaneseDate(dateStr: string): string {
    if (!dateStr) return "";

    const match = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
    if (!match) return "";

    const year = match[1];
    const month = match[2].padStart(2, "0");
    const day = match[3].padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/**
 * Yahoo!競馬のレースデータを既存の Race 型に変換
 */
export function convertYahooRaceToRace(yahooRace: any, horses: any[]) {
    const raceId =
        yahooRace.raceId ??
        extractRaceIdFromUrl(yahooRace.detailUrl) ??
        "";

    return {
        id: raceId,
        name: yahooRace.title,
        date:
            parseJapaneseDate(yahooRace.date) ||
            parseJapaneseDate(yahooRace.originalDate),

        place: yahooRace.place ?? null,
        raceNumber: yahooRace.raceNumber ?? null,

        course: {
            surface: yahooRace.surface ?? null,
            direction: yahooRace.direction ?? null,
            courseDetail: yahooRace.courseDetail ?? null,
            distance: yahooRace.distance ?? null,
        },

        grade: yahooRace.grade ?? "",
        distance: yahooRace.distance ?? null,
        track: yahooRace.surface ?? null,
        weightType: yahooRace.weightType ?? null,

        horses: horses.map((h) => ({
            number: h.number,
            name: h.name,
            jockey: h.jockey,
            frame: h.frame,
            weight: h.weight,
        })),

        result: null,
    };
}

/**
 * 複数レースをまとめて Race 型に変換
 */
export function convertToRacesObject(
    racesWithHorses: { yahooRace: any; horses: any[] }[]
) {
    const racesObj: Record<string, any> = {};

    racesWithHorses.forEach(({ yahooRace, horses }) => {
        const race = convertYahooRaceToRace(yahooRace, horses);
        racesObj[race.id] = race;
    });

    return racesObj;
}