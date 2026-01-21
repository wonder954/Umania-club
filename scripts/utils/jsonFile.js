const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const RACES_FILE = path.join(DATA_DIR, "races.json");

function loadJson(filePath = RACES_FILE) {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    const content = fs.readFileSync(filePath, "utf-8");
    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse JSON:", e);
        return {};
    }
}

function saveJson(data, filePath = RACES_FILE) {
    // Ensure data dir exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Saved to ${filePath}`);
}

module.exports = { loadJson, saveJson };
