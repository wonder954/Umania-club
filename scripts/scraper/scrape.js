import { fetchWeeklyRaces, fetchRaceDetail } from './jra-scraper.js';
import { saveRace } from './firestore.js';

/**
 * メインスクレイピング処理
 */
async function main() {
    try {
        console.log('=== JRA Race Scraper Started ===');
        const startTime = Date.now();

        // 1. 重賞レース一覧を取得
        console.log('\n[Step 1] Fetching weekly G1/G2/G3 races...');
        const races = await fetchWeeklyRaces();

        if (races.length === 0) {
            console.log('No races found this week.');
            process.exit(0);
        }

        console.log(`Found ${races.length} races`);

        // 2. 各レースの詳細を取得 & 保存
        const results = [];
        const errors = [];

        for (let i = 0; i < races.length; i++) {
            const summary = races[i];

            try {
                console.log(`\n[${i + 1}/${races.length}] Fetching ${summary.name}...`);
                const detail = await fetchRaceDetail(summary.url);

                // Firestoreに保存
                await saveRace(detail);

                results.push({
                    id: detail.id,
                    name: detail.name,
                    horsesCount: detail.horses.length,
                });

                // レート制限回避
                if (i < races.length - 1) {
                    await sleep(2000);
                }
            } catch (error) {
                console.error(`Failed to process ${summary.name}:`, error.message);
                errors.push({
                    race: summary.name,
                    error: error.message,
                });
            }
        }

        // 3. 結果を出力
        const duration = Date.now() - startTime;
        const output = {
            success: true,
            totalRaces: races.length,
            savedRaces: results.length,
            failedRaces: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined,
            duration: `${(duration / 1000).toFixed(2)}s`,
        };

        console.log('\n=== Scraping Complete ===');
        console.log(JSON.stringify(output, null, 2));

        // JSON形式で標準出力（API Routeで受け取り可能）
        process.stdout.write(JSON.stringify(output));

        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);

        const errorOutput = {
            success: false,
            error: error.message,
            stack: error.stack,
        };

        process.stderr.write(JSON.stringify(errorOutput));
        process.exit(1);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 実行
main();
