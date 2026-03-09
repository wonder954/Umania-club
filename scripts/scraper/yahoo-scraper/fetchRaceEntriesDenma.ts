import type { Entry, RaceInfo } from '../../../types/race';
import { createBrowserPage, extractRaceInfo } from './helpers';

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