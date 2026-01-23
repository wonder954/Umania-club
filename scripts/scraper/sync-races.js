import { fetchWeeklyRacesYahoo, fetchRaceDetailYahoo } from './yahoo-scraper.js';
import { convertToRacesObject } from './data-converter.js';
import fs from 'fs';
import path from 'path';

/**
 * Yahoo!競馬から今週の重賞データを取得してdata/races.jsonに保存
 */
async function syncRaces() {
    console.log('🏇 Yahoo!競馬から重賞データを取得開始...\n');

    try {
        // Step 1: 今週の重賞一覧を取得
        console.log('📋 Step 1: 重賞一覧を取得中...');
        const weeklyRaces = await fetchWeeklyRacesYahoo();
        console.log(`✅ ${weeklyRaces.length} レースを取得しました\n`);

        if (weeklyRaces.length === 0) {
            console.log('⚠️  今週の重賞が見つかりませんでした。');
            return;
        }

        // Step 2: 各レースの詳細（馬情報）を取得
        console.log('🐴 Step 2: 各レースの馬情報を取得中...');
        const racesWithHorses = [];

        for (let i = 0; i < weeklyRaces.length; i++) {
            const race = weeklyRaces[i];
            console.log(`  [${i + 1}/${weeklyRaces.length}] ${race.title} を取得中...`);

            try {
                const { date, horses } = await fetchRaceDetailYahoo(race.detailUrl);

                racesWithHorses.push({
                    yahooRace: { ...race, date },
                    horses
                });

                console.log(`    ✅ ${horses.length} 頭の馬情報を取得`);
            } catch (error) {
                console.error(`    ❌ エラー: ${error.message}`);
                // エラーが発生してもスキップして続行
            }

            // サーバーに負荷をかけないよう少し待機
            if (i < weeklyRaces.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(`\n✅ ${racesWithHorses.length}/${weeklyRaces.length} レースのデータ取得完了`);

        // Step 3: データを変換
        console.log('\n🔄 Step 3: データを変換中...');
        const racesObject = convertToRacesObject(racesWithHorses);
        console.log(`✅ ${Object.keys(racesObject).length} レースを変換しました`);

        // Step 4: data/races.json に保存
        console.log('\n💾 Step 4: data/races.json に保存中...');

        // スクリプトの場所からプロジェクトルートまで戻る
        const scriptDir = new URL('.', import.meta.url).pathname.slice(1); // Remove leading slash for Windows
        const projectRoot = path.join(scriptDir, '..', '..');
        const dataDir = path.join(projectRoot, 'data');
        const racesFilePath = path.join(dataDir, 'races.json');

        console.log(`  保存先: ${racesFilePath}`);

        // dataディレクトリが存在しない場合は作成
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('  📁 data ディレクトリを作成しました');
        }

        // JSONファイルに保存
        fs.writeFileSync(
            racesFilePath,
            JSON.stringify(racesObject, null, 2),
            'utf8'
        );

        console.log(`✅ ${racesFilePath} に保存しました`);

        // Step 5: 保存されたデータのサマリーを表示
        console.log('\n📊 保存されたレース一覧:');
        Object.values(racesObject).forEach((race, index) => {
            console.log(`  ${index + 1}. [${race.grade}] ${race.name} (${race.date})`);
            const c = race.course;
            console.log(
                `     ${c.surface ?? ''}${c.direction ?? ''}${c.courseDetail ?? ''} ${c.distance ?? ''}m - ${race.horses.length}頭`
            );
        });

        console.log('\n🎉 同期完了！Next.jsで確認してください。');
        console.log('   $ npm run dev');
        console.log('   http://localhost:3000');

    } catch (error) {
        console.error('\n❌ エラーが発生しました:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// スクリプト実行
syncRaces();
