/**
 * Parse HTML to extract Race Information (Friday version)
 * Usually similar to Monday but verifying it matches is good
 * @param {Document} doc 
 * @returns {Object} raceInfo
 */
function parseFridayRaceInfo(doc) {
    // Similar logic to Monday
    const raceName = doc.querySelector(".RaceName")?.textContent?.trim() || "Unknown Race";
    const dateText = doc.querySelector(".Date")?.textContent?.trim() || "2024-01-01";
    const courseText = doc.querySelector(".Course")?.textContent?.trim() || "Tokyo 11R";

    return {
        name: raceName,
        date: dateText,
        course: courseText
    };
}

/**
 * Parse HTML to extract Horses with bracket numbers (Friday version)
 * @param {Document} doc 
 * @returns {Array} horses
 */
function parseFridayHorses(doc) {
    const rows = doc.querySelectorAll(".BracketList tr");
    const horses = [];

    rows.forEach(row => {
        const numberStr = row.querySelector(".HorseNumber")?.textContent?.trim(); // e.g. "1"
        const name = row.querySelector(".HorseName")?.textContent?.trim();

        if (name && numberStr) {
            horses.push({
                number: parseInt(numberStr, 10),
                name: name
            });
        }
    });

    return horses;
}

module.exports = { parseFridayRaceInfo, parseFridayHorses };
