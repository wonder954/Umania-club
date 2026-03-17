import type { Entry, RaceInfo } from '../../../lib/race/info';
import { createBrowserPage, extractRaceInfo } from './helpers';

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