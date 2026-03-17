import type { RaceInfo, RaceResult, RaceOrder, Payout } from '../../../lib/race/info';
import { createBrowserPage, extractRaceInfo } from './helpers';

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

        // 距離とコース情報を取得
        const courseInfo = await page.evaluate(() => {
            const statusTexts = Array.from(
                document.querySelectorAll('.hr-predictRaceInfo__status .hr-predictRaceInfo__text')
            ).map(el => el.textContent?.trim() || '');

            let distance: number | undefined;
            let surface: string | undefined;
            let direction: string | undefined;

            for (const text of statusTexts) {
                const match = text.match(/(芝|ダート)[・･]?(右|左|外|内|直線)?[・･]?(外|内)?\s*(\d{3,4})m/);
                if (match) {
                    surface = match[1];
                    direction = match[2] || undefined;
                    distance = Number(match[4]);
                    break;
                }
            }

            return { distance, surface, direction };
        });

        console.log(`Extracted course info:`, courseInfo);

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

            const sections = document.querySelectorAll('.hr-splits__item') || [];

            if (sections.length === 0) {
                console.log("⚠️ payout sections が 0 件。Yahoo! DOM が変わった可能性");
                return result;
            }

            sections.forEach(section => {
                const rows = section.querySelectorAll('tbody tr');
                let currentKey: keyof Payout | null = null;

                rows.forEach(row => {
                    const th = row.querySelector('th');
                    const typeName = th?.textContent?.trim() || '';

                    if (typeName && typeMap[typeName]) {
                        currentKey = typeMap[typeName];
                    }

                    if (!currentKey) return;
                    const key = currentKey as keyof Payout;

                    const cells = row.querySelectorAll('td');
                    if (cells.length < 2) return;

                    const numbersText = cells[0].textContent?.trim() || '';
                    const numbers = numbersText
                        .split(/[-→]/)
                        .map(n => parseInt(n.trim()))
                        .filter(n => !isNaN(n));

                    const amountText = cells[1].textContent?.trim().replace(/[,円]/g, '') || '0';
                    const amount = parseInt(amountText) || 0;

                    const popularText = cells[2]?.textContent?.trim().replace(/人気/g, '') || '0';
                    const popular = parseInt(popularText) || 0;

                    if (numbers.length === 0 || amount === 0) return;

                    if (!result[key]) {
                        result[key] = [];
                    }

                    result[key].push({ numbers, amount, popular });
                });
            });

            return result;
        });

        console.log(`Found ${order.length} order entries`);

        const mergedInfo: Partial<RaceInfo> = {
            ...info,
            distance: courseInfo.distance,
            surface: courseInfo.surface,
            direction: courseInfo.direction,
        };

        console.log(`Final info:`, mergedInfo);

        return {
            info: mergedInfo,
            result: { order, payout },
        };

    } finally {
        await browser.close();
    }
}