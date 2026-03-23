import type { RaceInfo } from '../../../lib/race/info';
import type { RaceEntry } from '../../../lib/race/types';
import { createBrowserPage, extractRaceInfo } from './helpers';
import { yahooSelectors } from './selectors';
import { safeSelectors } from '../../utils/safeSelectors';

/**
 * 特別登録ページから出馬表を取得（馬番なし）
 * URL例: https://sports.yahoo.co.jp/keiba/race/regist/2606010811
 */
export async function fetchRaceEntriesRegist(
    url: string
): Promise<{ info: Partial<RaceInfo>; entries: RaceEntry[] }> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log(`Fetching regist page: ${url}`);
        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        const info = await extractRaceInfo(page);

        // ★ evaluate に渡す前に安全化
        const sel = safeSelectors(yahooSelectors);

        const entries = await page.evaluate((sel) => {
            const results: {
                frame: null;
                number: null;
                name: string;
                sex: null;
                age: null;
                jockey: null;
                weight: null;
                odds: null;
                popular: null;
            }[] = [];

            const table = document.querySelector(sel.regist.table);
            if (!table) return results;

            const rows = table.querySelectorAll(sel.regist.rows);

            rows.forEach((row: any) => {
                const horseCell = row.querySelector(sel.regist.horseCell);
                if (!horseCell) return;

                const name = horseCell.querySelector('a')?.textContent?.trim() ?? '';
                if (!name) return;

                results.push({
                    frame: null,
                    number: null,
                    name,
                    sex: null,
                    age: null,
                    jockey: null,
                    weight: null,
                    odds: null,       // ★ RaceEntry に合わせる
                    popular: null,    // ★ RaceEntry に合わせる
                });
            });

            return results;
        }, sel);
        console.log(`Found ${entries.length} entries (regist)`);

        return { info, entries };

    } finally {
        await browser.close();
    }
}