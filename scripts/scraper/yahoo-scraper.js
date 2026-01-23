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
            const rows = document.querySelectorAll('.hr-tableLeft__dataArea');

            rows.forEach(row => {
                const title = row.querySelector('.hr-tableLeft__title')?.textContent?.trim() || '';
                const grade = row.querySelector('.hr-label')?.textContent?.trim() || '';
                const status = row.querySelector('.hr-tableLeft__status')?.textContent?.trim() || '';
                const link = row.querySelector('.hr-tableLeft__link')?.href || '';

                // ★ 重賞以外はスキップ
                if (!['GI', 'GII', 'GIII'].includes(grade)) return;

                // ★ index → denma に変換
                const detailUrl = link.replace('/race/index/', '/race/denma/');

                // 芝・右・外 2200m
                const courseMatch = status.match(/(芝|ダート)[・･]?(右|左|外|内|直線)?[・･]?(外|内)?\s*(\d{3,4})m/);
                const surface = courseMatch?.[1] || null;
                const direction = courseMatch?.[2] || null;
                const courseDetail = courseMatch?.[3] || null;
                const distance = courseMatch ? parseInt(courseMatch[4], 10) : null;

                // 別定・定量・ハンデ
                const weightMatch = status.match(/(定量|別定|ハンデ|馬齢)/);
                const weightType = weightMatch?.[1] || null;

                results.push({
                    title,
                    grade,
                    detailUrl,
                    surface,
                    direction,
                    courseDetail,
                    distance,
                    weightType,
                    date: null, // 日付は detail ページで取得する
                });
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

        // ページタイプ判定（重要：denuma → denma）
        const isRegistPage = url.includes('/race/regist/');
        const isDenmaPage = url.includes('/race/denma/');
        const isResultPage = url.includes('/race/result/');

        const pageType = isRegistPage
            ? 'regist'
            : isDenmaPage
                ? 'denma'
                : isResultPage
                    ? 'result'
                    : 'unknown';

        console.log(`Page type: ${pageType}`);
        console.log(`Navigating to: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        // ★ レース日付を取得（今回のエラー原因の解消ポイント）
        let raceDate = null;
        try {
            raceDate = await page.$eval(
                '.hr-predictRaceInfo__date .hr-predictRaceInfo__text',
                el => el.textContent.trim()
            );
        } catch {
            console.log('Race date not found');
        }

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
                    // 特別登録ページ
                    if (pageType === 'regist') {
                        const horseCell = row.querySelector('.hr-table__data--horse');
                        const nameLink = horseCell?.querySelector('a');
                        const name = nameLink?.textContent?.trim() || '';

                        const horseText = horseCell?.textContent?.trim() || '';
                        const sexAgeMatch = horseText.match(/([牡牝セ])(\d+)/);
                        const sex = sexAgeMatch ? sexAgeMatch[1] : null;
                        const age = sexAgeMatch ? parseInt(sexAgeMatch[2]) : null;

                        const weightCell = row.querySelector('.hr-table__data--weight');
                        const weightText = weightCell?.textContent?.trim() || '';
                        const weight = weightText ? parseFloat(weightText) : null;

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
                                trainer,
                            });
                        }
                    } else {
                        // ★ 出馬表ページ（denma）・結果ページ（result）

                        // 枠番
                        const frame = row.querySelector('.hr-icon__bracketNum')
                            ?.textContent?.trim() || null;

                        // 馬番（2つ目の number セル）
                        const numberCells = row.querySelectorAll('.hr-table__data--number');
                        const number = numberCells[1]?.textContent?.trim() || null;

                        // 馬名・性齢
                        const nameCell = row.querySelectorAll('.hr-table__data--name')[0];
                        const name = nameCell?.querySelector('a')?.textContent?.trim() || null;

                        const sexAgeText =
                            nameCell?.querySelector('p')?.textContent?.trim() || '';
                        const sexAgeMatch = sexAgeText.match(/^([牡牝セ])(\d+)/);
                        const sex = sexAgeMatch?.[1] || null;
                        const age = sexAgeMatch ? parseInt(sexAgeMatch[2]) : null;

                        // 騎手・斤量
                        const jockeyCell = row.querySelectorAll('.hr-table__data--name')[1];
                        const jockey =
                            jockeyCell?.querySelector('a')?.textContent?.trim() || null;

                        const weightText =
                            jockeyCell?.querySelector('p')?.textContent?.trim() || '';
                        const weight = weightText ? parseFloat(weightText) : null;

                        results.push({
                            frame,
                            number,
                            name,
                            sex,
                            age,
                            jockey,
                            weight,
                        });
                    }
                } catch (error) {
                    console.error(`Error parsing horse row ${index}:`, error);
                }
            });

            return results;
        }, pageType);

        console.log(`Extracted ${horses.length} horses from ${pageType} page`);

        // ★ raceDate を返すように変更
        return { date: raceDate, horses };

    } catch (error) {
        console.error('Error in fetchRaceDetailYahoo:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
