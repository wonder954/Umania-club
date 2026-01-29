import puppeteer, { Browser, Page } from 'puppeteer';
import type { RaceListItem, Entry, RaceResult, RaceOrder, Payout, PayoutItem, RaceInfo } from '../../types/race';

// ============================================
// 共通ヘルパー
// ============================================

/**
 * ブラウザとページを作成
 */
async function createBrowserPage(): Promise<{ browser: Browser; page: Page }> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    return { browser, page };
}

/**
 * ページからレース情報を抽出
 */
async function extractRaceInfo(page: Page): Promise<Partial<RaceInfo>> {
    return await page.evaluate(() => {
        const number = document
            .querySelector('.hr-predictRaceInfo__raceNumber')
            ?.textContent?.trim() || null;

        const dateTexts = Array.from(
            document.querySelectorAll('.hr-predictRaceInfo__date .hr-predictRaceInfo__text')
        ).map(el => (el as HTMLElement).textContent?.trim() || '');

        const dateRaw = dateTexts[0] || null; // "2026年1月24日（土）"
        const placeRaw = dateTexts[1] || null; // "1回小倉1日"

        // 日付を YYYY-MM-DD に変換
        let date = '';
        if (dateRaw) {
            const m = dateRaw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (m) {
                date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
            }
        }

        // 場所を抽出
        let place = '';
        if (placeRaw) {
            const m = placeRaw.match(/回(.+?)\d/);
            place = m ? m[1] : '';
        }

        return {
            raceNumber: number || undefined,
            date,
            place,
            placeDetail: placeRaw || undefined,
        };
    });
}

/**
 * URL から raceId を抽出
 */
function extractRaceId(url: string): string {
    const match = url.match(/\/(\d{10})$/);
    return match ? match[1] : '';
}

// ============================================
// 公開API
// ============================================

/**
 * Yahoo!競馬 重賞レース一覧を取得
 */
export async function fetchWeeklyRacesYahoo(): Promise<RaceListItem[]> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log('Navigating to Yahoo! Keiba...');
        await page.goto('https://sports.yahoo.co.jp/keiba/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        console.log('Extracting race list...');

        const races = await page.evaluate(() => {
            const results: Array<{
                raceId: string;
                title: string;
                grade: string;
                detailUrl: string;
                surface: string | null;
                direction: string | null;
                courseDetail: string | null;
                distance: number | null;
                weightType: string | null;
            }> = [];

            const rows = document.querySelectorAll('.hr-tableLeft__dataArea');

            rows.forEach(row => {
                const title = row.querySelector('.hr-tableLeft__title')?.textContent?.trim() || '';
                const grade = row.querySelector('.hr-label')?.textContent?.trim() || '';
                const status = row.querySelector('.hr-tableLeft__status')?.textContent?.trim() || '';
                const link = (row.querySelector('.hr-tableLeft__link') as HTMLAnchorElement)?.href || '';

                // 重賞以外はスキップ
                if (!['GI', 'GII', 'GIII'].includes(grade)) return;

                // index → denma に変換
                const detailUrl = link.replace('/race/index/', '/race/denma/');

                // raceId を抽出
                const raceIdMatch = link.match(/\/(\d{10})$/);
                const raceId = raceIdMatch ? raceIdMatch[1] : '';

                // コース情報を解析
                const courseMatch = status.match(/(芝|ダート)[・･]?(右|左|外|内|直線)?[・･]?(外|内)?\s*(\d{3,4})m/);
                const surface = courseMatch?.[1] || null;
                const direction = courseMatch?.[2] || null;
                const courseDetail = courseMatch?.[3] || null;
                const distance = courseMatch ? parseInt(courseMatch[4], 10) : null;

                // 斤量タイプ
                const weightMatch = status.match(/(定量|別定|ハンデ|馬齢)/);
                const weightType = weightMatch?.[1] || null;

                results.push({
                    raceId,
                    title,
                    grade,
                    detailUrl,
                    surface,
                    direction,
                    courseDetail,
                    distance,
                    weightType,
                });
            });

            return results;
        });

        console.log(`Found ${races.length} races`);
        return races as RaceListItem[];

    } finally {
        await browser.close();
    }
}

/**
 * 特別登録ページから出馬表を取得（馬番なし）
 * URL例: https://sports.yahoo.co.jp/keiba/race/regist/2606010811
 */
export async function fetchRaceEntriesRegist(url: string): Promise<{ info: Partial<RaceInfo>; entries: Entry[] }> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log(`Fetching regist page: ${url}`);
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        const info = await extractRaceInfo(page);

        const entries = await page.evaluate(() => {
            const results: Entry[] = [];
            const horseTable = document.querySelector('.hr-table');
            if (!horseTable) return results;

            const rows = horseTable.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const horseCell = row.querySelector('.hr-table__data--horse');
                const name = horseCell?.querySelector('a')?.textContent?.trim() || null;

                if (name) {
                    results.push({
                        frame: null,
                        number: null,
                        name,
                        sex: undefined,
                        age: undefined,
                        jockey: undefined,
                        weight: undefined,
                    });
                }
            });

            return results;
        });

        console.log(`Found ${entries.length} entries (regist)`);
        return { info, entries };

    } finally {
        await browser.close();
    }
}

/**
 * 出馬表ページから出馬表を取得（馬番あり）
 * URL例: https://sports.yahoo.co.jp/keiba/race/denma/2606010811
 */
export async function fetchRaceEntriesDenma(url: string): Promise<{ info: Partial<RaceInfo>; entries: Entry[] }> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log(`Fetching denma page: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        const info = await extractRaceInfo(page);

        const entries = await page.evaluate(() => {
            const results: Entry[] = [];
            const horseTable = document.querySelector('.hr-table');
            if (!horseTable) return results;

            const rows = horseTable.querySelectorAll('tbody tr');

            rows.forEach(row => {
                // 枠番
                const frameEl = row.querySelector('.hr-icon__bracketNum');
                const frame = frameEl?.textContent?.trim() ? parseInt(frameEl.textContent.trim()) : null;

                // 馬番
                const numberCells = row.querySelectorAll('.hr-table__data--number');
                const numberText = numberCells[1]?.textContent?.trim();
                const number = numberText ? parseInt(numberText) : null;

                // 馬名・性齢
                const nameCell = row.querySelectorAll('.hr-table__data--name')[0];
                const name = nameCell?.querySelector('a')?.textContent?.trim() || '';
                const sexAgeText = nameCell?.querySelector('p')?.textContent?.trim() || '';
                const sexAgeMatch = sexAgeText.match(/^([牡牝セ])(\d+)/);
                const sex = sexAgeMatch?.[1] || undefined;
                const age = sexAgeMatch ? parseInt(sexAgeMatch[2]) : undefined;

                // 騎手・斤量
                const jockeyCell = row.querySelectorAll('.hr-table__data--name')[1];
                const jockey = jockeyCell?.querySelector('a')?.textContent?.trim() || undefined;
                const weightText = jockeyCell?.querySelector('p')?.textContent?.trim() || '';
                const weight = weightText ? parseFloat(weightText) : undefined;

                // オッズ・人気（あれば）
                const oddsCell = row.querySelector('.hr-table__data--odds');
                let odds: number | undefined;
                let popular: number | undefined;
                if (oddsCell) {
                    const oddsText = oddsCell.textContent?.trim() || '';
                    const oddsMatch = oddsText.match(/(\d+)\s*\((\d+\.?\d*)\)/);
                    if (oddsMatch) {
                        popular = parseInt(oddsMatch[1]);
                        odds = parseFloat(oddsMatch[2]);
                    }
                }

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
                        popular,
                    });
                }
            });

            return results;
        });

        console.log(`Found ${entries.length} entries (denma)`);
        return { info, entries };

    } finally {
        await browser.close();
    }
}

/**
 * 結果ページからレース結果を取得
 * URL例: https://sports.yahoo.co.jp/keiba/race/result/2606010811
 */
export async function fetchRaceResult(url: string): Promise<{ info: Partial<RaceInfo>; result: RaceResult }> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log(`Fetching result page: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        const info = await extractRaceInfo(page);

        // 着順データを取得
        const order = await page.evaluate(() => {
            const results: RaceOrder[] = [];
            const rows = document.querySelectorAll('.hr-table__row');

            rows.forEach(row => {
                const cells = row.querySelectorAll('.hr-table__data--number');
                const rank = cells[0]?.textContent?.trim();
                if (!rank || isNaN(parseInt(rank))) return;

                const frameEl = row.querySelector('.hr-icon__bracketNum');
                const frame = frameEl?.textContent?.trim() ? parseInt(frameEl.textContent.trim()) : 0;

                const number = cells[2]?.textContent?.trim() ? parseInt(cells[2].textContent.trim()) : 0;

                const nameCells = row.querySelectorAll('.hr-table__data--name');
                const name = nameCells[0]?.querySelector('a')?.textContent?.trim() || '';

                const timeCell = row.querySelector('.hr-table__data--time');
                const time = timeCell?.childNodes[0]?.textContent?.trim() || '';
                const margin = timeCell?.querySelector('p')?.textContent?.trim() || '-';

                const jockey = nameCells[1]?.querySelector('a')?.textContent?.trim() || '';
                const weight = nameCells[1]?.querySelector('p')?.textContent?.trim() || '';

                const oddsCell = row.querySelector('.hr-table__data--odds');
                let popular = 0;
                let odds = 0;
                if (oddsCell) {
                    const popularText = oddsCell.childNodes[0]?.textContent?.trim() || '';
                    popular = parseInt(popularText) || 0;
                    const oddsText = oddsCell.querySelector('p')?.textContent?.trim() || '';
                    const oddsMatch = oddsText.match(/\(?([\d.]+)\)?/);
                    odds = oddsMatch ? parseFloat(oddsMatch[1]) : 0;
                }

                results.push({
                    rank: parseInt(rank),
                    frame,
                    number,
                    name,
                    time,
                    margin,
                    jockey,
                    weight,
                    popular,
                    odds,
                });
            });

            return results;
        });

        // 払戻金データを取得
        const payout = await page.evaluate(() => {
            const result: Payout = {
                win: [],
                place: [],
                quinella: [],
                wide: [],
                exacta: [],
                trio: [],
                trifecta: [],
            };

            // 券種名から英語キーへのマッピング
            const typeMap: Record<string, keyof Payout> = {
                '単勝': 'win',
                '複勝': 'place',
                '枠連': 'bracket',
                '馬連': 'quinella',
                'ワイド': 'wide',
                '馬単': 'exacta',
                '3連複': 'trio',
                '3連単': 'trifecta',
            };

            const sections = document.querySelectorAll('.hr-splits__item');

            sections.forEach(section => {
                const rows = section.querySelectorAll('tr');

                rows.forEach(row => {
                    const typeCell = row.querySelector('th');
                    const typeName = typeCell?.textContent?.trim() || '';
                    const key = typeMap[typeName];
                    if (!key) return;

                    const cells = row.querySelectorAll('td');
                    if (cells.length < 3) return;

                    // 組番号を解析
                    const numbersText = cells[0]?.textContent?.trim() || '';
                    const numbers = numbersText
                        .split(/[-→]/)
                        .map(n => parseInt(n.trim()))
                        .filter(n => !isNaN(n));

                    // 払戻金
                    const amountText = cells[1]?.textContent?.trim().replace(/[,円]/g, '') || '0';
                    const amount = parseInt(amountText) || 0;

                    // 人気
                    const popularText = cells[2]?.textContent?.trim().replace(/人気/g, '') || '0';
                    const popular = parseInt(popularText) || 0;

                    if (numbers.length > 0 && amount > 0) {
                        if (!result[key]) {
                            (result as any)[key] = [];
                        }
                        (result[key] as PayoutItem[]).push({
                            numbers,
                            amount,
                            popular,
                        });
                    }
                });
            });

            return result;
        });

        console.log(`Found ${order.length} order entries, payout types: ${Object.keys(payout).length}`);

        return {
            info,
            result: { order, payout },
        };

    } finally {
        await browser.close();
    }
}

/**
 * Yahoo!競馬トップから「前回のレース情報」を取得
 * 先週の重賞レース一覧を返す
 */
export async function fetchLastWeekRacesYahoo(): Promise<Array<{
    raceId: string;
    title: string;
    grade: string;
    resultUrl: string;
}>> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log('Navigating to Yahoo! Keiba for last week races...');
        await page.goto('https://sports.yahoo.co.jp/keiba/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        console.log('Extracting last week race list...');

        const races = await page.evaluate(() => {
            const results: Array<{
                raceId: string;
                title: string;
                grade: string;
                resultUrl: string;
            }> = [];

            // 「前回のレース情報」セクションを探す
            const sections = Array.from(document.querySelectorAll('.hr-modCommon02'));

            for (const section of sections) {
                const heading = section.querySelector('h3');
                if (!heading || !heading.textContent?.includes('前回のレース情報')) {
                    continue;
                }

                // テーブル内のリンクを取得
                const rows = section.querySelectorAll('.hr-tableLeft__data');

                rows.forEach((row: Element) => {
                    const link = row.querySelector('a') as HTMLAnchorElement;
                    if (!link) return;

                    const href = link.href;
                    const title = link.textContent?.trim() || '';

                    // 重賞ラベルをチェック
                    const label = row.querySelector('.hr-label');
                    const labelText = label?.textContent?.trim() || '';

                    // GI, GII, GIII のみ対象
                    if (!['GI', 'GII', 'GIII'].includes(labelText)) return;

                    // raceId を URL 末尾から抽出
                    const raceIdMatch = href.match(/(\d{10})$/);
                    const raceId = raceIdMatch ? raceIdMatch[1] : '';

                    if (!raceId) return;

                    // URL を result ページに変換
                    const resultUrl = href.replace('/race/index/', '/race/result/');

                    results.push({
                        raceId,
                        title,
                        grade: labelText,
                        resultUrl,
                    });
                });
            }

            return results;
        });

        console.log(`Found ${races.length} last week races`);
        return races;

    } finally {
        await browser.close();
    }
}

// 後方互換性のためのエクスポート
export { extractRaceId };

