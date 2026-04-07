import type { RaceInfo } from '../../../lib/race/info';
import type { RaceEntry } from '../../../lib/race/types';
import { createBrowserPage, extractRaceInfo } from './helpers';
import { yahooSelectors } from './selectors';
import { safeSelectors } from '../../utils/safeSelectors';

/**
 * 出馬表ページから出馬表を取得（馬番あり）
 * URL例: https://sports.yahoo.co.jp/keiba/race/denma/2606010811
 */
export async function fetchRaceEntriesDenma(
    url: string
): Promise<{ info: Partial<RaceInfo>; entries: RaceEntry[] }> {
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

            // ★ 今の Yahoo は .hr-table__row が正しい
            const rows = table.querySelectorAll(sel.entries.rows);

            rows.forEach((row: any) => {
                // --- 枠番 ---
                const frameEl = row.querySelector(sel.entries.frame);
                const frame = frameEl?.textContent?.trim()
                    ? parseInt(frameEl.textContent.trim())
                    : null;

                // --- 馬番（2つあるうちの2つ目）---
                const numberCells = row.querySelectorAll(sel.entries.number);
                const numberText =
                    numberCells[1]?.textContent?.trim() ||
                    numberCells[0]?.textContent?.trim() ||
                    null;
                const number = numberText ? parseInt(numberText) : null;

                // --- nameCell は複数あるので 0番目が馬名 ---
                const nameCells = row.querySelectorAll(sel.entries.nameCell);
                const horseCell = nameCells[0];
                const jockeyCell = nameCells[1]; // 騎手＋斤量

                // --- 馬名 ---
                const name =
                    horseCell?.querySelector("a")?.textContent?.trim() || "";

                // --- 性齢（例: 牡8/鹿毛 → 牡8 を抽出）---
                const sexAgeText =
                    horseCell?.querySelector("p")?.textContent?.trim() || "";
                const sexAgeMatch = sexAgeText.match(/^([牡牝セ])(\d+)/);
                const sex = sexAgeMatch?.[1] || null;
                const age = sexAgeMatch ? parseInt(sexAgeMatch[2]) : null;

                // --- 騎手 ---
                const jockey =
                    jockeyCell?.querySelector("a")?.textContent?.trim() || null;

                // --- 斤量 ---
                const weightText =
                    jockeyCell?.querySelector("p")?.textContent?.trim() || "";
                const weight = weightText ? parseFloat(weightText) : null;

                if (name) {
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
            });

            return results;
        }, sel);

        console.log(`Found ${entries.length} entries (denma)`);
        return { info, entries };

    } finally {
        await browser.close();
    }
}