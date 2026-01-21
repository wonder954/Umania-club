/**
 * Parse HTML to extract Race Information (Monday version)
 * @param {Document} doc 
 * @returns {Object} raceInfo
 */
function parseMondayRaceInfo(doc) {
    // TODO: Update selectors based on actual JRA page structure
    const raceName = doc.querySelector(".RaceName")?.textContent?.trim() || "Unknown Race";
    const dateText = doc.querySelector(".Date")?.textContent?.trim() || "2024-01-01"; // Format needed
    const courseText = doc.querySelector(".Course")?.textContent?.trim() || "Tokyo 11R";

    // Clean up date format if necessary
    // Assuming simple parsing for demo

    return {
        name: raceName,
        date: dateText, // Should normalize to YYYY-MM-DD
        course: courseText,
        grade: "G1", // Placeholder, need logic to parse G1/G2/G3 etc.
        distance: 1600, // Placeholder
        track: "Turf", // Placeholder
        weightType: "Age/Sex", // Placeholder
    };
}

/**
 * Parse HTML to extract Horse Entries (Monday version - No Numbers)
 * @param {Document} doc 
 * @returns {Array} horses
 */
function parseMondayHorses(doc) {
    const rows = doc.querySelectorAll(".HorseList tr");
    const horses = [];

    rows.forEach(row => {
        const name = row.querySelector(".HorseName")?.textContent?.trim();
        if (name) {
            horses.push({
                name,
                jockey: row.querySelector(".Jockey")?.textContent?.trim() || "",
                sex: "Male", // Placeholder parsing
                age: 3, // Placeholder parsing
                weight: 57 // Placeholder parsing
            });
        }
    });

    return horses;
}

module.exports = { parseMondayRaceInfo, parseMondayHorses };
