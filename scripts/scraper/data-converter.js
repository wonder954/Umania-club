/**
 * Yahoo!競馬スクレイパーのデータを既存のRace型に変換するユーティリティ
 */

/**
 * レースIDをURLから抽出
 * @param {string} url - Yahoo!競馬のURL
 * @returns {string} レースID (例: "2610010111")
 */
export function extractRaceIdFromUrl(url) {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? match[1] : '';
}

/**
 * 日本語の日付を YYYY-MM-DD 形式に変換
 * @param {string} dateStr - 日本語日付 (例: "1月24日（土）")
 * @returns {string} ISO形式の日付 (例: "2026-01-24")
 */
export function parseJapaneseDate(dateStr) {
    const year = new Date().getFullYear();
    const match = dateStr.match(/(\d+)月(\d+)日/);

    if (!match) {
        console.warn(`Failed to parse date: ${dateStr}`);
        return '';
    }

    const month = match[1].padStart(2, '0');
    const day = match[2].padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * 競馬場名を抽出
 * @param {string} turfText - コーステキスト (例: "小倉11R")
 * @returns {string} 競馬場名 (例: "小倉")
 */
export function extractCourse(turfText) {
    return turfText.replace(/\d+R$/, '').trim();
}

/**
 * Yahoo!競馬のレースデータを既存のRace型に変換
 * @param {Object} yahooRace - fetchWeeklyRacesYahoo() の返却データ
 * @param {Array} horses - fetchRaceDetailYahoo() の返却データ
 * @returns {Object} Race型のオブジェクト
 */
export function convertYahooRaceToRace(yahooRace, horses) {
    const raceId = extractRaceIdFromUrl(yahooRace.detailUrl);

    return {
        id: raceId,
        name: yahooRace.title,
        date: parseJapaneseDate(yahooRace.date),
        course: extractCourse(yahooRace.turf),
        grade: yahooRace.grade,
        distance: null, // Yahoo!データからは取得できないため null
        track: null,    // Yahoo!データからは取得できないため null
        weightType: null, // Yahoo!データからは取得できないため null
        horses: horses.map(horse => ({
            number: horse.number,
            name: horse.name,
            jockey: horse.jockey
        })),
        result: null
    };
}

/**
 * 複数のレースデータをまとめてRace型に変換し、IDをキーとしたオブジェクトを返す
 * @param {Array} racesWithHorses - [{ yahooRace, horses }] の配列
 * @returns {Object} { raceId: Race } の形式
 */
export function convertToRacesObject(racesWithHorses) {
    const racesObj = {};

    racesWithHorses.forEach(({ yahooRace, horses }) => {
        const race = convertYahooRaceToRace(yahooRace, horses);
        racesObj[race.id] = race;
    });

    return racesObj;
}
