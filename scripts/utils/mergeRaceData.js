/**
 * Merge Friday's data (numbers) into Monday's existing data
 * @param {Object} mondayData 
 * @param {Array} fridayHorses 
 * @returns {Object} mergedData
 */
function mergeRaceData(mondayData, fridayHorses) {
    if (!mondayData || !mondayData.horses) {
        console.warn("Monday data is missing or invalid.");
        return mondayData;
    }

    const updatedHorses = mondayData.horses.map(mondayHorse => {
        // Find matching horse in friday list by name
        const match = fridayHorses.find(f => f.name === mondayHorse.name);

        if (match) {
            return {
                ...mondayHorse,
                number: match.number
            };
        } else {
            console.warn(`No bracket number found for ${mondayHorse.name}`);
            return mondayHorse;
        }
    });

    // Sort by horse number if available
    updatedHorses.sort((a, b) => {
        if (a.number && b.number) return a.number - b.number;
        return 0;
    });

    return {
        ...mondayData,
        horses: updatedHorses
    };
}

module.exports = { mergeRaceData };
