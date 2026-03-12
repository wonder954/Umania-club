// utils/data-converter.ts

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
        raceId,
        info: {
            title: yahooRace.title,
            date:
                parseJapaneseDate(yahooRace.date) ||
                parseJapaneseDate(yahooRace.originalDate),
            grade: yahooRace.grade ?? "",
            surface: yahooRace.surface ?? null,
            distance: yahooRace.distance ?? null,
            direction: yahooRace.direction ?? null,
            courseDetail: yahooRace.courseDetail ?? null,
            weightType: yahooRace.weightType ?? null,
            raceNumber: yahooRace.raceNumber ?? null,
            place: yahooRace.place ?? null,
            placeDetail: yahooRace.placeDetail ?? null,
        },
        entries: horses.map((h) => ({
            frame: h.frame,
            number: h.number,
            name: h.name,
            jockey: h.jockey,
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
        racesObj[race.raceId] = race;
    });

    return racesObj;
}