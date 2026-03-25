import type { RaceInfo } from '../../../lib/race/info';
import type { RaceResult } from '../../../lib/race/types';
import { createBrowserPage, extractRaceInfo } from './helpers';
import { yahooSelectors } from './selectors';
import { safeSelectors } from '../../utils/safeSelectors';

export async function fetchRaceResult(
    url: string
): Promise<{ info: Partial<RaceInfo>; result: RaceResult }> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log(`Fetching result page: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        const info = await extractRaceInfo(page);

        // ★ evaluate に渡す前に安全化
        const sel = safeSelectors(yahooSelectors);

        // ============================
        // ① コース情報
        // ============================
        const courseInfo = await page.evaluate((sel) => {
            const statusTexts = Array.from(
                document.querySelectorAll(sel.result.courseStatus)
            ).map((el: any) => el.textContent?.trim() || "");

            let distance = null;
            let surface = null;
            let direction = null;

            for (const text of statusTexts) {
                const match = text.match(
                    /(芝|ダート)[・･\s]*?(右|左|外|内|直線)?[・･\s]*?(外|内)?[・･\s]*?(\d{3,4})m/
                );
                if (match) {
                    surface = match[1];
                    direction = match[2] || null;
                    distance = Number(match[4]);
                    break;
                }
            }

            return { distance, surface, direction };
        }, sel);

        console.log(`Extracted course info:`, courseInfo);

        // ============================
        // ② 着順データ
        // ============================
        const order = await page.evaluate((sel) => {
            const results: any[] = [];

            const rows = document.querySelectorAll(sel.result.rows);

            rows.forEach((row: any) => {
                const numberCells = row.querySelectorAll(sel.result.number);

                const rankText = numberCells[0]?.textContent?.trim();
                if (!rankText || isNaN(parseInt(rankText))) return;

                const frameEl = row.querySelector(sel.result.frame);
                const frame = frameEl?.textContent?.trim()
                    ? parseInt(frameEl.textContent.trim())
                    : 0;

                const numberText = numberCells[2]?.textContent?.trim();
                const number = numberText ? parseInt(numberText) : 0;

                const nameCells = row.querySelectorAll(sel.result.nameCell);
                const name = nameCells[0]?.querySelector("a")?.textContent?.trim() || "";

                const jockey = nameCells[1]?.querySelector("a")?.textContent?.trim() || "";
                const weight = nameCells[1]?.querySelector("p")?.textContent?.trim() || "";

                const timeCell = row.querySelector(sel.result.time);
                const time = timeCell?.childNodes[0]?.textContent?.trim() || "";
                const margin = timeCell?.querySelector("p")?.textContent?.trim() || "-";

                const oddsCell = row.querySelector(sel.result.odds);
                let popular = 0;
                let odds = 0;

                if (oddsCell) {
                    const popularText = oddsCell.childNodes[0]?.textContent?.trim() || "";
                    popular = parseInt(popularText) || 0;

                    const oddsText = oddsCell.querySelector("p")?.textContent?.trim() || "";
                    const oddsMatch = oddsText.match(/\(?([\d.]+)\)?/);
                    odds = oddsMatch ? parseFloat(oddsMatch[1]) : 0;
                }

                results.push({
                    rank: parseInt(rankText),
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
        }, sel);

        // ============================
        // ③ 払戻金データ
        // ============================
        const payout = await page.evaluate((sel) => {
            const result: any = {};

            const typeMap: any = {
                "単勝": "win",
                "複勝": "place",
                "枠連": "bracket",
                "馬連": "quinella",
                "ワイド": "wide",
                "馬単": "exacta",
                "3連複": "trio",
                "3連単": "trifecta",
            };

            const sections = document.querySelectorAll(sel.result.payout.section);

            sections.forEach((section: any) => {
                const rows = section.querySelectorAll(sel.result.payout.rows);
                let currentKey: string | null = null;

                rows.forEach((row: any) => {
                    const th = row.querySelector(sel.result.payout.type);
                    const typeName = th?.textContent?.trim() || "";

                    if (typeName && typeMap[typeName]) {
                        currentKey = typeMap[typeName];
                    }
                    if (!currentKey) return;

                    const cells = row.querySelectorAll(sel.result.payout.cells);

                    const cell0 = cells[0];
                    const cell1 = cells[1];
                    const cell2 = cells[2];

                    if (!cell0 || !cell1) return;

                    const numbersText = cell0.textContent?.trim() || "";
                    const numbers = numbersText
                        .split(/[-→]/)
                        .map((n: string) => parseInt(n.trim()))
                        .filter((n: number) => !isNaN(n));

                    const amountText = cell1.textContent?.trim().replace(/[,円]/g, "") || "0";
                    const amount = parseInt(amountText) || 0;

                    const popularRaw = cell2 ? cell2.textContent?.trim() ?? "" : "";
                    const popularText = popularRaw.replace(/人気/g, "") || "0";
                    const popular = parseInt(popularText) || 0;

                    if (numbers.length === 0 || amount === 0) return;

                    (result[currentKey] ??= []).push({ numbers, amount, popular });
                });
            });

            return result;
        }, sel);

        console.log(`Found ${order.length} order entries`);

        const mergedInfo: Partial<RaceInfo> = {
            ...info,
            distance: courseInfo.distance,
            surface: courseInfo.surface,
            direction: courseInfo.direction,
        };

        return {
            info: mergedInfo,
            result: { order, payout },
        };

    } finally {
        await browser.close();
    }
}