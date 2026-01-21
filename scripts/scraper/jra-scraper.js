import puppeteer from 'puppeteer';

/**
 * JRA重賞レース一覧を取得
 */
export async function fetchWeeklyRaces() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        console.log('Navigating to JRA重賞ページ...');
        await page.goto('https://www.jra.go.jp/JRADB/accessD.html', {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        console.log('Extracting race list...');

        // ▼▼▼ ここで DOM を確認する ▼▼▼
        const html = await page.content();
        console.log("===== DEBUG: HTML snapshot start =====");
        console.log(html);
        console.log("===== DEBUG: HTML snapshot end =====");
        // ▲▲▲ ここまで ▲▲▲


        const races = await page.evaluate(() => {
            const results = [];
            const panels = document.querySelectorAll('.panel');

            panels.forEach((panel) => {
                const dateHeader = panel.querySelector('h3.sub_header');
                const dateText = dateHeader?.textContent?.trim() || '';

                const raceItems = panel.querySelectorAll('ul.grade_race_unit li.opt_on');

                raceItems.forEach((li, index) => {
                    const link = li.querySelector('a');
                    if (!link) return;

                    const href = link.href;
                    const raceNum = link.querySelector('.race_num span')?.textContent?.trim() || '';
                    const nameNode = link.querySelector('.txt');
                    const name = nameNode?.childNodes[1]?.textContent?.trim() || '';
                    const gradeImg = link.querySelector('.grade_icon img');
                    const grade = gradeImg?.getAttribute('alt') || '';
                    const hasNumbers = !!li.querySelector('.umaban');
                    const course = raceNum.replace(/\d+R/, '');

                    results.push({
                        id: `race_${Date.now()}_${index}`,
                        name,
                        grade,
                        date: dateText,
                        course,
                        url: href,
                        hasNumbers,
                    });
                });
            });

            return results;
        });

        console.log(`Found ${races.length} races`);
        return races;
    } catch (error) {
        console.error('Error in fetchWeeklyRaces:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * 個別レースの詳細情報を取得
 */
export async function fetchRaceDetail(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await page.setExtraHTTPHeaders({
            Referer: 'https://www.jra.go.jp/',
        });

        console.log(`Navigating to race detail: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        const raceDetail = await page.evaluate(() => {
            const titleBlock = document.querySelector('.race_title .txt');
            const name = titleBlock?.querySelector('.race_name')?.childNodes[0]?.textContent.trim() || '';
            const gradeImg = titleBlock?.querySelector('.race_name .grade_icon img');
            const grade = gradeImg?.getAttribute('alt') || '';

            const courseText = titleBlock?.querySelector('.cell.course')?.textContent || '';
            const distanceMatch = courseText.replace(/,/g, '').match(/(\d+)メートル/);
            const distance = distanceMatch ? parseInt(distanceMatch[1]) : null;

            const surfaceMatch = courseText.match(/（(.+?)・/);
            const surface = surfaceMatch ? surfaceMatch[1] : '';

            const turnMatch = courseText.match(/・(.+?)）/);
            const turn = turnMatch ? turnMatch[1] : '';

            const infoBlock = document.querySelector('.race_data, .raceInfo, .raceData');
            const infoText = infoBlock?.textContent || '';

            const dateMatch = infoText.match(/(\d+)月(\d+)日/);
            const date = dateMatch
                ? `2024-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`
                : '';

            const courseMatch = infoText.match(/(東京|中山|阪神|京都|新潟|福島|小倉|札幌|函館|中京)/);
            const course = courseMatch ? courseMatch[1] : '';

            const horses = [];
            const rows = document.querySelectorAll('table tr');

            rows.forEach((row, index) => {
                const wakuImg = row.querySelector('td.waku img');
                const numCell = row.querySelector('td.num');
                const horseCell = row.querySelector('td.horse');

                if (!horseCell) return;

                let frame = null;
                if (wakuImg) {
                    const alt = wakuImg.getAttribute('alt') || '';
                    const match = alt.match(/枠(\d+)/);
                    frame = match ? parseInt(match[1]) : null;
                }

                const number = numCell ? parseInt(numCell.textContent.trim()) : null;
                const horseName = horseCell.querySelector('.name a')?.textContent?.trim() || '';
                const jockey = horseCell.querySelector('.jockey a')?.textContent?.trim() || '';
                const oddsText = horseCell.querySelector('.odds_line .num strong')?.textContent?.trim() || null;
                const odds = oddsText ? parseFloat(oddsText) : null;

                horses.push({
                    id: `horse_${index}`,
                    name: horseName,
                    jockey,
                    frame,
                    number,
                    odds,
                });
            });

            return {
                name,
                grade,
                date,
                course,
                distance,
                surface,
                turn,
                horses,
            };
        });

        console.log(`Extracted ${raceDetail.horses.length} horses from ${raceDetail.name}`);

        return {
            id: generateRaceId(raceDetail.name, raceDetail.date),
            ...raceDetail,
            hasNumbers: raceDetail.horses.some(h => h.number !== null),
        };
    } catch (error) {
        console.error('Error in fetchRaceDetail:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * レースIDを生成
 */
function generateRaceId(name, date) {
    const normalized = name.replace(/[（）\s]/g, '');
    const dateStr = date.replace(/-/g, '');
    return `${dateStr}_${normalized}`;
}
