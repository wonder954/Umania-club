import { createBrowserPage } from './helpers';

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

                const rows = section.querySelectorAll('.hr-tableLeft__data');

                rows.forEach((row: Element) => {
                    const link = row.querySelector('a') as HTMLAnchorElement;
                    if (!link) return;

                    const href = link.href;
                    const title = link.textContent?.trim() || '';

                    const label = row.querySelector('.hr-label');
                    const labelText = label?.textContent?.trim() || '';

                    // GI, GII, GIII のみ対象
                    if (!['GI', 'GII', 'GIII'].includes(labelText)) return;

                    const raceIdMatch = href.match(/(\d{10})$/);
                    const raceId = raceIdMatch ? raceIdMatch[1] : '';

                    if (!raceId) return;

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