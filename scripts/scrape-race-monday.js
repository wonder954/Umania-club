const { fetchHtml } = require("./utils/fetchHtml");
const { parseMondayRaceInfo, parseMondayHorses } = require("./utils/parseMonday");
const { parseRaceId } = require("./utils/parseRaceId");
const { loadJson, saveJson } = require("./utils/jsonFile");

// Target URL - In reality, this might be passed as an arg or fetched from a schedule page
const TARGET_URL = "https://www.jra.go.jp/JRADB/accessS.html"; // Placeholder URL

async function main() {
    console.log("Starting Monday Scrape...");
    try {
        // 1. Fetch HTML
        // For demo purposes, we might need a real valid URL or mock behavior
        // Since we can't access live internet arbitrarily for scraping without valid URL, 
        // we assume the user provides specific URL or we use a mock HTML locally for testing.
        // For now, implementing the flow as requested.

        // const html = await fetchHtml(TARGET_URL); 

        // MOCKING for development validation without hitting external site
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;
        const mockHtml = `
      <html>
        <body>
          <div class="RaceName">根岸ステークス</div>
          <div class="Date">2024-01-28</div>
          <div class="Course">東京11R</div>
          <table class="HorseList">
            <tr><td class="HorseName">ドライスタウト</td><td class="Jockey">戸崎圭太</td></tr>
            <tr><td class="HorseName">タガノビューティー</td><td class="Jockey">石橋脩</td></tr>
          </table>
        </body>
      </html>
    `;
        const doc = new JSDOM(mockHtml).window.document;

        // 2. Parse Info
        const raceInfo = parseMondayRaceInfo(doc);
        const horses = parseMondayHorses(doc);
        const raceId = parseRaceId(raceInfo);

        console.log(`Parsed Race: ${raceInfo.name} (ID: ${raceId})`);

        // 3. Load & Update JSON
        const racesJson = loadJson();

        racesJson[raceId] = {
            id: raceId,
            ...raceInfo,
            horses,
            result: null,
            updatedAt: new Date().toISOString()
        };

        saveJson(racesJson);
        console.log("Monday Scrape Completed Successfully.");

    } catch (error) {
        console.error("Scrape Failed:", error);
        process.exit(1);
    }
}

main();
