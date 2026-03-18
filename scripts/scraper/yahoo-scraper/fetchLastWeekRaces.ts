import { createBrowserPage } from './helpers';
import { normalizeGrade } from '../../utils/raceGradeUtils';
import { yahooSelectors } from './selectors';
import { safeSelectors } from '../../utils/safeSelectors';

/** Yahoo!競馬トップから「前回のレース情報」を取得 */
export async function fetchLastWeekRacesYahoo(): Promise<
    Array<{
        raceId: string;
        title: string;
        grade: string;
        resultUrl: string;
    }>
> {
    const { browser, page } = await createBrowserPage();

    try {
        console.log("Navigating to Yahoo! Keiba for last week races...");
        await page.goto("https://sports.yahoo.co.jp/keiba/", {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        console.log("Extracting last week race list...");

        // ★ evaluate に渡す前に安全化
        const sel = safeSelectors(yahooSelectors);

        const rawRaces = await page.evaluate((sel) => {
            const results: any[] = [];

            const sections = document.querySelectorAll(sel.weeklyPast.section);

            sections.forEach((section: any) => {
                const heading = section.querySelector(sel.weeklyPast.heading);
                if (!heading) return;
                if (!heading.textContent?.includes("前回のレース情報")) return;

                const rows = section.querySelectorAll(sel.weeklyPast.rows);

                rows.forEach((row: any) => {
                    const link = row.querySelector(sel.weeklyPast.link);
                    if (!link) return;

                    const href = link.href;
                    const title = link.textContent?.trim() || "";

                    const gradeEl = row.querySelector(sel.weeklyPast.grade);
                    const rawGrade = gradeEl?.textContent?.trim() || "";

                    const raceIdMatch = href.match(/(\d{10})$/);
                    const raceId = raceIdMatch ? raceIdMatch[1] : "";
                    if (!raceId) return;

                    const resultUrl = href.replace("/race/index/", "/race/result/");

                    results.push({
                        raceId,
                        title,
                        grade: rawGrade,
                        resultUrl,
                    });
                });
            });

            return results;
        }, sel);

        const races = rawRaces
            .map((r: any) => ({
                ...r,
                grade: normalizeGrade(r.grade),
            }))
            .filter((r: any) =>
                ["G1", "G2", "G3", "JG1", "JG2", "JG3"].includes(r.grade)
            );

        console.log(`Found ${races.length} last week races`);
        return races;

    } finally {
        await browser.close();
    }
}