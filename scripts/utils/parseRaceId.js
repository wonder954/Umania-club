/**
 * Generate Race ID from parsed info
 * Format: YYYYMMDD_placeRR (e.g., 20240128_tokyo11)
 * @param {Object} raceInfo 
 * @returns {string}
 */
function parseRaceId(raceInfo) {
    // Simple mapping for place names if needed, or assume raceInfo already has normalized keys
    // This is a placeholder logic based on potential scrape results
    const dateStr = raceInfo.date.replace(/-/g, ""); // 2024-01-28 -> 20240128
    // Assuming course string includes place like "Tokyo 11R" -> "tokyo11"
    // Needs adjustment based on actual JRA HTML text
    const courseMatch = raceInfo.course.match(/([a-zA-Z]+)(\d+)R/i) || raceInfo.course.match(/(\S+)(\d+)R/);

    // Mapping Japanese place names to english keys if necessary
    const placeMap = {
        "東京": "tokyo", "中山": "nakayama", "京都": "kyoto", "阪神": "hanshin",
        "新潟": "niigata", "福島": "fukushima", "中京": "chukyo", "小倉": "kokura",
        "札幌": "sapporo", "函館": "hakodate"
    };

    let placeKey = "unknown";
    let raceNum = "11";

    if (courseMatch) { // if english format "Tokyo11R"
        placeKey = courseMatch[1].toLowerCase();
        raceNum = courseMatch[2];
    } else {
        // Try to find known Japanese place name in course string
        for (const [jp, en] of Object.entries(placeMap)) {
            if (raceInfo.course.includes(jp)) {
                placeKey = en;
                break;
            }
        }
        const numMatch = raceInfo.course.match(/(\d+)R/);
        if (numMatch) raceNum = numMatch[1];
    }

    return `${dateStr}_${placeKey}${raceNum}`;
}

module.exports = { parseRaceId };
