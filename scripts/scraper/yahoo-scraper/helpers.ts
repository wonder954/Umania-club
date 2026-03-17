import puppeteer, { Browser, Page } from 'puppeteer';
import type { RaceInfo } from '../../../lib/race/info';

// ============================================
// 共通ヘルパー
// ============================================

export type WeeklyRace = {
    raceId: string;
    title: string;
    grade: string | null;
    date: string;
    detailUrl: string;
    surface?: string;
    distance?: number;
    direction?: string;
    courseDetail?: string;
    weightType?: string;
};

/**
 * ブラウザとページを作成
 */
export async function createBrowserPage(): Promise<{ browser: Browser; page: Page }> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    return { browser, page };
}

/**
 * ページからレース情報を抽出
 */
export async function extractRaceInfo(page: Page): Promise<Partial<RaceInfo>> {
    return await page.evaluate(() => {
        const number =
            document.querySelector('.hr-predictRaceInfo__raceNumber')
                ?.textContent?.trim() || null;

        const dateTexts = Array.from(
            document.querySelectorAll('.hr-predictRaceInfo__date .hr-predictRaceInfo__text')
        ).map(el => el.textContent?.trim() || '');

        const dateRaw = dateTexts[0] || null;
        const placeRaw = dateTexts[1] || null;

        let date = '';
        if (dateRaw) {
            const m = dateRaw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (m) {
                date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
            }
        }

        let place = '';
        if (placeRaw) {
            const m = placeRaw.match(/回(.+?)\d/);
            place = m ? m[1] : '';
        }

        const statusTexts = Array.from(
            document.querySelectorAll('.hr-predictRaceInfo__status .hr-predictRaceInfo__text')
        ).map(el => el.textContent?.trim() || "");

        let surface: string | null = null;
        let direction: string | null = null;
        let courseDetail: string | null = null;
        let distance: number | null = null;
        let weightType: string | null = null;

        for (const text of statusTexts) {
            const courseMatch = text.match(
                /(芝|ダート)[・･]?\s*(右|左|外|内|直線)?\s*(外|内)?\s*(\d{3,4})m/
            );
            if (courseMatch) {
                surface = courseMatch[1] || null;
                direction = courseMatch[2] || null;
                courseDetail = courseMatch[3] || null;
                distance = courseMatch ? Number(courseMatch[4]) : null;
            }

            const weightMatch = text.match(/(馬齢|別定|定量|ハンデ)/);
            if (weightMatch) {
                weightType = weightMatch[1];
            }
        }

        return {
            raceNumber: number || undefined,
            date,
            place,
            placeDetail: placeRaw || undefined,
            surface,
            direction,
            courseDetail,
            distance,
            weightType,
        };
    });
}

/**
 * URL から raceId を抽出
 */
export function extractRaceId(url: string): string {
    const match = url.match(/\/(\d{10})$/);
    return match ? match[1] : '';
}