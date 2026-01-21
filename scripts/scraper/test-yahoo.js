import { fetchWeeklyRacesYahoo, fetchRaceDetailYahoo } from './yahoo-scraper.js';
import fs from 'fs';

/**
 * Yahoo!競馬スクレイパーのテストスクリプト
 * Phase 4: 特別登録ページからの馬情報抽出テスト
 */
async function main() {
    console.log('Yahoo! Keiba Scraper - Phase 4 Test (Registration Page)\n');

    try {
        // まず重賞一覧を取得
        console.log('Step 1: Fetching weekly races...');
        const races = await fetchWeeklyRacesYahoo();
        console.log(`Found ${races.length} races\n`);

        // 最初のレース（特別登録ページ）の詳細を取得
        if (races.length > 0) {
            const firstRace = races[0];
            console.log(`Step 2: Fetching details from REGISTRATION page`);
            console.log(`Race: "${firstRace.title}"`);
            console.log(`URL: ${firstRace.detailUrl}\n`);

            const horses = await fetchRaceDetailYahoo(firstRace.detailUrl);

            // 結果を保存
            const result = {
                race: firstRace,
                pageType: 'registration',
                horses: horses
            };

            fs.writeFileSync(
                'regist-result.json',
                JSON.stringify(result, null, 2),
                'utf8'
            );

            console.log(`\nExtracted ${horses.length} horses from registration page`);
            console.log('Result saved to regist-result.json');

            // 最初の3頭を表示
            if (horses.length > 0) {
                console.log('\n=== Sample Horses (first 3) ===');
                horses.slice(0, 3).forEach((horse, index) => {
                    console.log(`${index + 1}. ${horse.name} (${horse.sex}${horse.age})`);
                    console.log(`   Frame: ${horse.frame || 'TBD'}, Number: ${horse.number || 'TBD'}`);
                    console.log(`   Trainer: ${horse.trainer || 'N/A'}, Weight: ${horse.weight}kg`);
                    console.log(`   Jockey: ${horse.jockey || 'TBD'}, Odds: ${horse.odds || 'TBD'}`);
                });

                console.log('\n✅ Registration page test successful!');
                console.log('NOTE: Frame, Number, Jockey, and Odds will be available after Friday.');
            } else {
                console.log('\nNo horses extracted. Check the DOM structure.');
            }
        } else {
            console.log('No races found to test with.');
        }
    } catch (error) {
        console.error('\nError:', error.message);
        console.error(error.stack);
    }
}

main();
