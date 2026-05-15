import fs from "fs";
import path from "path";
import { db } from "@/src//lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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

export async function loadAllRaces() {
    const ref = collection(db, "races");
    const snap = await getDocs(ref);

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}