const { fetchHtml } = require("./utils/fetchHtml");
const { parseFridayRaceInfo, parseFridayHorses } = require("./utils/parseFriday");
const { parseRaceId } = require("./utils/parseRaceId");
const { mergeRaceData } = require("./utils/mergeRaceData");
const { loadJson, saveJson } = require("./utils/jsonFile");

// Target URL
const TARGET_URL = "https://www.jra.go.jp/JRADB/accessS.html"; // Placeholder

async function main() {
    console.log("Starting Friday Scrape...");
    try {
        // MOCK HTML for validaton
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;
        const mockHtml = `
      <html>
        <body>
          <div class="RaceName">根岸ステークス</div>
          <div class="Date">2024-01-28</div>
          <div class="Course">東京11R</div>
          <table class="BracketList">
            <tr><td class="HorseNumber">1</td><td class="HorseName">ドライスタウト</td></tr>
            <tr><td class="HorseNumber">2</td><td class="HorseName">タガノビューティー</td></tr>
          </table>
        </body>
      </html>
    `;
        const doc = new JSDOM(mockHtml).window.document;

        // 1. Parse Info
        const raceInfo = parseFridayRaceInfo(doc);
        const raceId = parseRaceId(raceInfo);
        const fridayHorses = parseFridayHorses(doc);

        // 2. Load Existing Data
        const racesJson = loadJson();
        const mondayData = racesJson[raceId];

        if (!mondayData) {
            console.error(`Error: Race data for ID ${raceId} not found. Run Monday scrape first.`);
            process.exit(1);
        }

        // 3. Merge
        const merged = mergeRaceData(mondayData, fridayHorses);
        racesJson[raceId] = {
            ...merged,
            updatedAt: new Date().toISOString()
        };

        saveJson(racesJson);
        console.log("Friday Scrape (Merge) Completed Successfully.");

    } catch (error) {
        console.error("Scrape Failed:", error);
        process.exit(1);
    }
}

main();
