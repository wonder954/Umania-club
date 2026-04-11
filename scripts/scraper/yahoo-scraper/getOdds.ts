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

        const entries = await page.evaluate(() => {
            const results: any[] = [];

            const rows = document.querySelectorAll("tr.hr-table__row");

            rows.forEach((row: any) => {
                // 馬番（2番目の number セル）
                const numberText =
                    row.querySelector("td.hr-table__data--number:nth-child(2)")
                        ?.textContent?.trim() ?? null;
                const number = numberText ? parseInt(numberText) : null;

                const oddsCell = row.querySelector("td.hr-table__data--odds");
                let odds: number | null = null;
                let popular: number | null = null;

                if (oddsCell) {
                    const text = oddsCell.textContent.trim(); // "10(69.1)"

                    // 人気順位（先頭の数字）
                    const match = text.match(/^(\d+)/);
                    popular = match ? parseInt(match[1]) : null;

                    // オッズ（span の中 or () の中）
                    const span = oddsCell.querySelector("span");
                    if (span) {
                        odds = parseFloat(span.textContent.trim());
                    } else {
                        // span が無い場合 → () の中を取る
                        const m = text.match(/\((.*?)\)/);
                        odds = m ? parseFloat(m[1]) : null;
                    }
                }

                if (number !== null) {
                    results.push({ number, odds, popular });
                }
            });

            return results;
        });

        console.log(`Found ${entries.length} odds entries`);
        return entries;
    } finally {
        await browser.close();
    }
}