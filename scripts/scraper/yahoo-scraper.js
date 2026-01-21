import puppeteer from 'puppeteer';

/**
 * Yahoo!競馬 重賞レース一覧を取得
 */
export async function fetchWeeklyRacesYahoo() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        console.log('Navigating to Yahoo! Keiba...');
        await page.goto('https://sports.yahoo.co.jp/keiba/', {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        console.log('Extracting race list...');

        const races = await page.evaluate(() => {
            const results = [];
            const bigRaceTable = document.querySelector('.hr-tableBigRace');

            if (!bigRaceTable) {
                console.log('Big race table not found');
                return results;
            }

            const rows = bigRaceTable.querySelectorAll('tbody tr');
            console.log(`Found ${rows.length} race rows`);

            rows.forEach((row, index) => {
                try {
                    const gradeCell = row.querySelector('.hr-tableBigRace__data--grade');
                    const gradeSpan = gradeCell?.querySelector('.hr-label');
                    const gradeText = gradeSpan?.textContent?.trim() || '';

                    const dateCell = row.querySelector('.hr-tableBigRace__data--date');
                    const dateText = dateCell?.querySelector('.hr-tableBigRace__date')?.textContent?.trim() || '';
                    const turfText = dateCell?.querySelector('.hr-tableBigRace__turf')?.textContent?.trim() || '';

                    const titleElement = row.querySelector('.hr-tableBigRace__title');
                    const title = titleElement?.textContent?.trim() || '';

                    const linkElement = row.querySelector('.hr-textList__item a');
                    const detailUrl = linkElement?.href || '';

                    if (gradeText && dateText && title && detailUrl) {
                        results.push({
                            grade: gradeText,
                            date: dateText,
                            turf: turfText,
                            title: title,
                            detailUrl: detailUrl
                        });
                    }
                } catch (error) {
                    console.error(`Error parsing row ${index}:`, error);
                }
            });

            return results;
        });

        console.log(`Found ${races.length} races`);
        return races;

    } catch (error) {
        console.error('Error in fetchWeeklyRacesYahoo:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * Yahoo!競馬のレース詳細ページから馬情報を取得
 * 
 * 対応ページ:
 * 1. 特別登録ページ (/race/regist/) - レース登録時（馬番・騎手未確定）
 * 2. 出馬表ページ (/race/denuma/) - 金曜日以降（馬番・騎手確定）
 * 3. 結果ページ (/race/result/) - レース後
 */
export async function fetchRaceDetailYahoo(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // ページタイプを判定
        const isRegistPage = url.includes('/race/regist/');
        const isDenumaPage = url.includes('/race/denuma/');
        const isResultPage = url.includes('/race/result/');

        const pageType = isRegistPage ? 'regist' : isDenumaPage ? 'denuma' : isResultPage ? 'result' : 'unknown';
        console.log(`Page type: ${pageType}`);
        console.log(`Navigating to: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        console.log('Extracting horse data...');

        const horses = await page.evaluate((pageType) => {
            const results = [];
            const horseTable = document.querySelector('.hr-table');

            if (!horseTable) {
                console.log('Horse table not found');
                return results;
            }

            const rows = horseTable.querySelectorAll('tbody tr');
            console.log(`Found ${rows.length} horse rows (page type: ${pageType})`);

            rows.forEach((row, index) => {
                try {
                    if (pageType === 'regist') {
                        // 特別登録ページ: 馬名、性齢、負担重量、調教師のみ取得

                        // 馬名と性齢
                        const horseCell = row.querySelector('.hr-table__data--horse');
                        const nameLink = horseCell?.querySelector('a');
                        const name = nameLink?.textContent?.trim() || '';

                        // 性齢（例: "牝6/鹿毛"）
                        const horseText = horseCell?.textContent?.trim() || '';
                        const sexAgeMatch = horseText.match(/([牡牝セ])(\d+)/);
                        const sex = sexAgeMatch ? sexAgeMatch[1] : null;
                        const age = sexAgeMatch ? parseInt(sexAgeMatch[2]) : null;

                        // 負担重量
                        const weightCell = row.querySelector('.hr-table__data--weight');
                        const weightText = weightCell?.textContent?.trim() || '';
                        const weight = weightText ? parseFloat(weightText) : null;

                        // 調教師（騎手欄に入っている）
                        const jockeyCell = row.querySelector('.hr-table__data--jockey');
                        const trainerLink = jockeyCell?.querySelector('a');
                        const trainer = trainerLink?.textContent?.trim() || null;

                        if (name) {
                            results.push({
                                frame: null,
                                number: null,
                                name,
                                sex,
                                age,
                                jockey: null,
                                weight,
                                odds: null,
                                popularity: null,
                                trainer  // 特別登録ページ専用フィールド
                            });
                        }
                    } else {
                        // 出馬表ページ・結果ページ: すべての情報を取得

                        // 枠番
                        const frameElement = row.querySelector('.hr-icon__bracketNum');
                        const frame = frameElement ? parseInt(frameElement.textContent.trim()) : null;

                        // 馬番
                        const numberCells = row.querySelectorAll('.hr-table__data--number');
                        const number = numberCells.length >= 3 ? parseInt(numberCells[2].textContent.trim()) : null;

                        // 馬名と性齢
                        const nameCells = row.querySelectorAll('.hr-table__data--name');
                        const nameCell = nameCells[0];
                        const nameLink = nameCell?.querySelector('a');
                        const name = nameLink?.textContent?.trim() || '';

                        const sexAgeText = nameCell?.querySelector('p')?.textContent?.trim() || '';
                        const sexMatch = sexAgeText.match(/^([牡牝セ])(\d+)/);
                        const sex = sexMatch ? sexMatch[1] : null;
                        const age = sexMatch ? parseInt(sexMatch[2]) : null;

                        // 騎手と負担重量
                        const jockeyCell = nameCells[1];
                        const jockeyLink = jockeyCell?.querySelector('a');
                        const jockey = jockeyLink?.textContent?.trim() || null;

                        const weightText = jockeyCell?.querySelector('p')?.textContent?.trim() || '';
                        const weight = weightText ? parseFloat(weightText) : null;

                        // オッズと人気
                        const oddsCell = row.querySelector('.hr-table__data--odds');
                        const popularityText = oddsCell?.childNodes[0]?.textContent?.trim() || '';
                        const popularity = popularityText ? parseInt(popularityText) : null;

                        const oddsParagraph = oddsCell?.querySelector('p')?.textContent?.trim() || '';
                        const oddsMatch = oddsParagraph.match(/\(([0-9.]+)\)/);
                        const odds = oddsMatch ? parseFloat(oddsMatch[1]) : null;

                        if (name) {
                            results.push({
                                frame,
                                number,
                                name,
                                sex,
                                age,
                                jockey,
                                weight,
                                odds,
                                popularity,
                                trainer: null  // 出馬表・結果ページでは不要
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error parsing horse row ${index}:`, error);
                }
            });

            return results;
        }, pageType);

        console.log(`Extracted ${horses.length} horses from ${pageType} page`);
        return horses;

    } catch (error) {
        console.error('Error in fetchRaceDetailYahoo:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
