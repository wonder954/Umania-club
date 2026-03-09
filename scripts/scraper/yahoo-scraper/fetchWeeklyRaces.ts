import type { RaceListItem } from '../../../types/race';
import { createBrowserPage } from './helpers';

/**
 * Yahoo!競馬 重賞レース一覧を取得
 */
export async function fetchWeeklyRacesYahoo(): Promise<RaceListItem[]> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log('Navigating to Yahoo! Keiba...');
        await page.goto('https://sports.yahoo.co.jp/keiba/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        console.log('Extracting race list...');

        const races = await page.evaluate(() => {
            const results: Array<{
                raceId: string;
                title: string;
                grade: string;
                detailUrl: string;
                surface: string | null;
                direction: string | null;
                courseDetail: string | null;
                distance: number | null;
                weightType: string | null;
            }> = [];

            const rows = document.querySelectorAll('.hr-tableLeft__dataArea');

            rows.forEach(row => {
                const titleElement = row.querySelector('.hr-tableLeft__title');
                const title = titleElement?.childNodes[0]?.textContent?.trim() || '';
                const grade = row.querySelector('.hr-label')?.textContent?.trim() || '';
                const status = row.querySelector('.hr-tableLeft__status')?.textContent?.trim() || '';
                const link = (row.querySelector('.hr-tableLeft__link') as HTMLAnchorElement)?.href || '';

                // 重賞以外はスキップ
                if (!['GI', 'GII', 'GIII'].includes(grade)) return;

                // index → denma に変換
                const detailUrl = link.replace('/race/index/', '/race/denma/');

                // raceId を抽出
                const raceIdMatch = link.match(/\/(\d{10})$/);
                const raceId = raceIdMatch ? raceIdMatch[1] : '';

                // コース情報を解析
                const courseMatch = status.match(
                    /(芝|ダート)[・･]?\s*(右|左|外|内|直線)?\s*(外|内)?\s*(\d{3,4})m/
                );
                const surface = courseMatch?.[1] || null;
                const direction = courseMatch?.[2] || null;
                const courseDetail = courseMatch?.[3] || null;
                const distance = courseMatch ? Number(courseMatch[4]) : null;

                // 斤量タイプ
                const weightMatch = status.match(/(定量|別定|ハンデ|馬齢)/);
                const weightType = weightMatch?.[1] || null;

                results.push({
                    raceId,
                    title,
                    grade,
                    detailUrl,
                    surface,
                    direction,
                    courseDetail,
                    distance,
                    weightType,
                });
            });

            return results;
        });

        console.log(`Found ${races.length} races`);
        return races as RaceListItem[];

    } finally {
        await browser.close();
    }
}