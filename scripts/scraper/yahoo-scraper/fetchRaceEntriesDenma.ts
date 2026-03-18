import type { Entry, RaceInfo } from '../../../lib/race/info';
import { createBrowserPage, extractRaceInfo } from './helpers';
import { yahooSelectors } from './selectors';
import { safeSelectors } from '../../utils/safeSelectors';

/**
 * 出馬表ページから出馬表を取得（馬番あり）
 * URL例: https://sports.yahoo.co.jp/keiba/race/denma/2606010811
 */
export async function fetchRaceEntriesDenma(
    url: string
): Promise<{ info: Partial<RaceInfo>; entries: Entry[] }> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log(`Fetching denma page: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        const info = await extractRaceInfo(page);

        // ★ evaluate に渡す前に安全化
        const sel = safeSelectors(yahooSelectors);

        const entries = await page.evaluate((sel) => {
            const results: any[] = [];

            const table = document.querySelector(sel.entries.table);
            if (!table) return results;

            const rows = table.querySelectorAll(sel.entries.rows);

            rows.forEach((row: any) => {
                const frameEl = row.querySelector(sel.entries.frame);
                const frame = frameEl?.textContent?.trim()
                    ? parseInt(frameEl.textContent.trim())
                    : null;

                const numberCells = row.querySelectorAll(sel.entries.number);
                const numberText =
                    numberCells[1]?.textContent?.trim() ||
                    numberCells[0]?.textContent?.trim() ||
                    null;
                const number = numberText ? parseInt(numberText) : null;

                const nameCell = row.querySelector(sel.entries.nameCell);
                const name = nameCell?.querySelector("a")?.textContent?.trim() || "";

                const sexAgeText = nameCell?.querySelector("p")?.textContent?.trim() || "";
                const sexAgeMatch = sexAgeText.match(/^([牡牝セ])(\d+)/);
                const sex = sexAgeMatch?.[1] || undefined;
                const age = sexAgeMatch ? parseInt(sexAgeMatch[2]) : undefined;

                const jockeyCell = nameCell?.nextElementSibling;
                const jockey = jockeyCell?.querySelector("a")?.textContent?.trim() || undefined;
                const weightText = jockeyCell?.querySelector("p")?.textContent?.trim() || "";
                const weight = weightText ? parseFloat(weightText) : undefined;

                const oddsCell = row.querySelector(sel.entries.odds);
                let odds: number | undefined;
                let popular: number | undefined;

                if (oddsCell) {
                    const popularText =
                        oddsCell.querySelector("strong")?.textContent?.trim() || "";
                    const oddsSpan =
                        oddsCell.querySelector("span")?.textContent?.trim() || "";

                    const p = parseInt(popularText);
                    popular = isNaN(p) ? undefined : p;

                    const o = parseFloat(oddsSpan);
                    odds = isNaN(o) ? undefined : o;
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
        }, sel);

        console.log(`Found ${entries.length} entries (denma)`);
        return { info, entries };

    } finally {
        await browser.close();
    }
}