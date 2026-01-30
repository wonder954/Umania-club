import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "scripts/scraper/data");

export function getLatestRaceFolder(): string | null {
    const folders = fs.readdirSync(DATA_DIR)
        .filter(name => /^\d{8}[wf]$/.test(name))
        .sort((a, b) => b.localeCompare(a));

    const friday = folders.find(f => f.endsWith("f"));
    if (friday) return friday;

    return folders.find(f => f.endsWith("w")) || null;
}

export function loadRaceJson(raceId: string) {
    const folder = getLatestRaceFolder();
    if (!folder) return null;

    const filePath = path.join(DATA_DIR, folder, "races", `${raceId}.json`);
    if (!fs.existsSync(filePath)) return null;

    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function loadAllRaces() {
    const folder = getLatestRaceFolder();
    if (!folder) return [];

    const racesDir = path.join(DATA_DIR, folder, "races");
    const files = fs.readdirSync(racesDir);

    return files.map(file => {
        const json = fs.readFileSync(path.join(racesDir, file), "utf-8");
        return JSON.parse(json);
    });
}