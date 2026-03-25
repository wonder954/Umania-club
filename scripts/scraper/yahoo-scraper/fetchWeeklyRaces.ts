import type { RaceListItem } from '../../types/raceList';
import { createBrowserPage } from './helpers';
import { normalizeGrade } from '../../utils/raceGradeUtils';
import { yahooSelectors } from './selectors';
import { safeSelectors } from '../../utils/safeSelectors';

export async function fetchWeeklyRacesYahoo(): Promise<RaceListItem[]> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log('Navigating to Yahoo! Keiba...');
        await page.goto('https://sports.yahoo.co.jp/keiba/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        // PC版のレース一覧が描画されるまで待つ
        await page.waitForSelector('.hr-tableLeft__dataArea', { timeout: 10000 });

        console.log('Extracting race list...');

        // ★ selectors を evaluate に安全に渡せる形に変換
        const sel = safeSelectors(yahooSelectors);

        const rawRaces = await page.evaluate((sel) => {
            const results: {
                raceId: string;
                title: string;
                grade: string;
                detailUrl: string;
                surface: string | null;
                direction: string | null;
                courseDetail: string | null;
                distance: number | null;
                weightType: string | null;
            }[] = [];

            const rows = document.querySelectorAll(sel.weeklyUpcoming.rows);

            rows.forEach((row) => {
                const title =
                    row.querySelector(sel.weeklyUpcoming.title)?.textContent?.trim() ?? '';

                const rawGrade =
                    row.querySelector(sel.weeklyUpcoming.grade)?.textContent?.trim() ?? '';

                const status =
                    row.querySelector(sel.weeklyUpcoming.status)?.textContent?.trim() ?? '';

                const link =
                    (row.querySelector(sel.weeklyUpcoming.link) as HTMLAnchorElement)?.href ?? '';

                const detailUrl = link.replace('/race/index/', '/race/denma/');

                const raceIdMatch = link.match(/\/(\d{10})$/);
                const raceId = raceIdMatch ? raceIdMatch[1] : '';

                const courseMatch = status.match(
                    /(芝|ダート)[・･\s]*?(右|左|外|内|直線)?[・･\s]*?(外|内)?[・･\s]*?(\d{3,4})m/
                );
                const surface = courseMatch?.[1] ?? null;
                const direction = courseMatch?.[2] ?? null;
                const courseDetail = courseMatch?.[3] ?? null;
                const distance = courseMatch ? Number(courseMatch[4]) : null;

                const weightMatch = status.match(/(定量|別定|ハンデ|馬齢)/);
                const weightType = weightMatch?.[1] ?? null;

                results.push({
                    raceId,
                    title,
                    grade: rawGrade,
                    detailUrl,
                    surface,
                    direction,
                    courseDetail,
                    distance,
                    weightType,
                });
            });

            return results;
        }, sel);

        const races = rawRaces
            .map((r) => ({
                ...r,
                grade: normalizeGrade(r.grade),
            }))
            .filter((r) => ['G1', 'G2', 'G3', 'JG1', 'JG2', 'JG3'].includes(r.grade));

        console.log(`Found ${races.length} races`);
        return races;
    } finally {
        await browser.close();
    }
}