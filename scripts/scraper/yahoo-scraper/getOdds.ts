// scripts/scraper/yahoo-scraper/getOdds.ts
import { createBrowserPage } from "./helpers";
import { yahooSelectors } from "./selectors";
import { safeSelectors } from "../../utils/safeSelectors";

/**
 * 出馬表ページからオッズだけ取得
 * URL例: https://sports.yahoo.co.jp/keiba/race/denma/2606010811
 */
export async function getOdds(url: string): Promise<
    { number: number; odds: number | null; popular: number | null }[]
> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log(`Fetching odds: ${url}`);
        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 30000,
        });

        const sel = safeSelectors(yahooSelectors);

        const entries = await page.evaluate((sel) => {
            const results: any[] = [];

            const table = document.querySelector(sel.entries.table);
            if (!table) return results;

            const rows = table.querySelectorAll(sel.entries.rows);

            rows.forEach((row: any) => {
                // 馬番（number）
                const numberCells = row.querySelectorAll(sel.entries.number);
                const numberText =
                    numberCells[1]?.textContent?.trim() ||
                    numberCells[0]?.textContent?.trim() ||
                    null;
                const number = numberText ? parseInt(numberText) : null;

                // オッズ
                const oddsCell = row.querySelector(sel.entries.odds);
                let odds: number | null = null;
                let popular: number | null = null;

                if (oddsCell) {
                    const popularText =
                        oddsCell.querySelector("strong")?.textContent?.trim() || "";
                    const oddsSpan =
                        oddsCell.querySelector("span")?.textContent?.trim() || "";

                    const p = parseInt(popularText);
                    popular = isNaN(p) ? null : p;

                    const o = parseFloat(oddsSpan);
                    odds = isNaN(o) ? null : o;
                }

                if (number !== null) {
                    results.push({ number, odds, popular });
                }
            });

            return results;
        }, sel);

        console.log(`Found ${entries.length} odds entries`);
        return entries;
    } finally {
        await browser.close();
    }
}