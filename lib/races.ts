import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RaceData, Entry } from "@/types/race";

// -----------------------------
// 型定義（レガシー向け）
// -----------------------------
export type Race = {
    id: string;
    name: string;
    date: string;
    place?: string;
    raceNumber?: string;

    course: {
        surface: string;       // 芝 or ダート
        distance: number;      // 2200
        direction: string;     // 右 or 左
        courseDetail?: string | null; // 外 or 内
    };

    grade?: string;
    weightType?: string;

    horses: Array<{
        number?: number | string;
        name: string;
        jockey?: string;
        weight?: number | string;
        frame?: number | string;
    }>;

    result: any;
};

// -----------------------------
// サーバーサイド判定
// -----------------------------
const isServer = typeof window === "undefined";

// -----------------------------
// スクレイパーデータフォルダ関連（サーバーサイドのみ）
// -----------------------------
const SCRAPER_DATA_DIR = "scripts/scraper/data";

/**
 * 日付フォルダ一覧を取得（降順ソート）
 */
async function listScraperFolders(): Promise<string[]> {
    if (!isServer) return [];

    const fs = await import("fs");
    const path = await import("path");
    const dirPath = path.join(process.cwd(), SCRAPER_DATA_DIR);

    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const folders = entries
        .filter(e => e.isDirectory() && /^\d{8}[wf]$/.test(e.name))
        .map(e => e.name)
        .sort((a, b) => b.localeCompare(a)); // 降順

    return folders;
}

/**
 * 最新のスクレイパーフォルダを取得
 */
async function getLatestScraperFolder(): Promise<string | null> {
    const folders = await listScraperFolders();
    return folders.length > 0 ? folders[0] : null;
}

/**
 * 最新の1つ前のフォルダを取得
 */
async function getPreviousScraperFolder(): Promise<string | null> {
    const folders = await listScraperFolders();
    return folders.length > 1 ? folders[1] : null;
}

/**
 * スクレイパーフォルダからレースデータを読み込み
 */
async function loadRaceFromScraperFolder(raceId: string, folderName: string): Promise<RaceData | null> {
    if (!isServer) return null;

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), SCRAPER_DATA_DIR, folderName, "races", `${raceId}.json`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as RaceData;
    } catch (error) {
        console.error(`Failed to load race data from scraper folder: ${raceId}`, error);
        return null;
    }
}

/**
 * 前週のフォルダから entries を読み込む
 */
export async function loadPreviousWeekEntries(raceId: string): Promise<Entry[] | null> {
    const prevFolder = await getPreviousScraperFolder();
    if (!prevFolder) return null;

    const data = await loadRaceFromScraperFolder(raceId, prevFolder);
    return data?.entries || null;
}

// -----------------------------
// JSON 版（廃止: data/races.json は削除済み）
// -----------------------------
export async function getRaceFromJson(raceId: string) {
    return null;
}

export async function getAllRacesFromJson(): Promise<Race[]> {
    return [];
}

// -----------------------------
// スクレイパーフォルダ版（新: scripts/scraper/data/{date}/races/{raceId}.json）
// -----------------------------
export async function getRaceFromScraperData(raceId: string): Promise<Race | null> {
    if (!isServer) {
        return getRaceFromJson(raceId);
    }

    // 最新フォルダを取得
    const latestFolder = await getLatestScraperFolder();
    if (!latestFolder) {
        return getRaceFromJson(raceId);
    }

    // 最新フォルダからデータを読み込み
    let data = await loadRaceFromScraperFolder(raceId, latestFolder);

    // もし entries がない場合、前週フォルダからフォールバック
    if (data && (!data.entries || data.entries.length === 0)) {
        console.log(`No entries in latest folder, trying previous folder for ${raceId}`);
        const prevEntries = await loadPreviousWeekEntries(raceId);
        if (prevEntries && prevEntries.length > 0) {
            data.entries = prevEntries;
            console.log(`Loaded ${prevEntries.length} entries from previous folder`);
        }
    }

    if (!data) {
        // フォールバック: レガシー JSON をチェック
        return getRaceFromJson(raceId);
    }

    // RaceData → Race 形式に変換
    return {
        id: data.raceId,
        name: data.info.title,
        date: data.info.date,
        place: data.info.place,
        raceNumber: data.info.raceNumber,
        course: {
            surface: data.info.surface || "",
            distance: data.info.distance || 0,
            direction: data.info.direction || "",
            courseDetail: data.info.courseDetail,
        },
        grade: data.info.grade,
        weightType: data.info.weightType,
        horses: (data.entries || []).map(e => ({
            number: e.number ?? undefined,
            name: e.name,
            jockey: e.jockey,
            weight: e.weight,
            frame: e.frame ?? undefined,
        })),
        result: data.result || null,
    };
}

export async function getAllRacesFromScraperData(): Promise<Race[]> {
    console.log("[lib/races] getAllRacesFromScraperData START");
    if (!isServer) {
        return getAllRacesFromJson();
    }

    const fs = await import("fs");
    const path = await import("path");

    const latestFolder = await getLatestScraperFolder();
    console.log(`[lib/races] Latest folder: ${latestFolder}`);

    if (!latestFolder) {
        console.log("[lib/races] No scraper folder found in list");
        return getAllRacesFromJson();
    }

    const folderPath = path.join(process.cwd(), SCRAPER_DATA_DIR, latestFolder, "races");
    console.log(`[lib/races] Checking folder path: ${folderPath}`);

    if (!fs.existsSync(folderPath)) {
        console.log("[lib/races] Folder path does NOT exist");
        return getAllRacesFromJson();
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
    console.log(`[lib/races] Found ${files.length} JSON files in ${latestFolder}`);
    const races: Race[] = [];

    for (const file of files) {
        const raceId = file.replace(".json", "");
        const race = await getRaceFromScraperData(raceId);
        if (race) races.push(race);
    }
    console.log(`[lib/races] Returning ${races.length} races`);

    return races;
}

// -----------------------------
// 個別 JSON 版（旧: data/races/{raceId}.json）
// サーバーサイドでのみ使用可能
// -----------------------------
export async function getRaceFromIndividualJson(raceId: string): Promise<Race | null> {
    if (!isServer) {
        return getRaceFromJson(raceId);
    }

    const fs = await import("fs");
    const path = await import("path");

    const filePath = path.join(process.cwd(), "data", "races", `${raceId}.json`);

    if (!fs.existsSync(filePath)) {
        return getRaceFromJson(raceId);
    }

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content) as RaceData;

        return {
            id: data.raceId,
            name: data.info.title,
            date: data.info.date,
            place: data.info.place,
            raceNumber: data.info.raceNumber,
            course: {
                surface: data.info.surface || "",
                distance: data.info.distance || 0,
                direction: data.info.direction || "",
                courseDetail: data.info.courseDetail,
            },
            grade: data.info.grade,
            weightType: data.info.weightType,
            horses: (data.entries || []).map(e => ({
                number: e.number ?? undefined,
                name: e.name,
                jockey: e.jockey,
                weight: e.weight,
                frame: e.frame ?? undefined,
            })),
            result: data.result || null,
        };
    } catch (error) {
        console.error(`Failed to load individual race data: ${raceId}`, error);
        return getRaceFromJson(raceId);
    }
}

export async function getAllRacesFromIndividualJson(): Promise<Race[]> {
    if (!isServer) {
        return getAllRacesFromJson();
    }

    const fs = await import("fs");
    const path = await import("path");

    const dirPath = path.join(process.cwd(), "data", "races");

    if (!fs.existsSync(dirPath)) {
        return getAllRacesFromJson();
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
    const races: Race[] = [];

    for (const file of files) {
        const raceId = file.replace(".json", "");
        const race = await getRaceFromIndividualJson(raceId);
        if (race) races.push(race);
    }

    return races;
}

// -----------------------------
// Firestore 版
// -----------------------------
export async function getRaceFromFirestore(raceId: string) {
    const ref = doc(db, "races", raceId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getAllRacesFromFirestore() {
    const snapshot = await getDocs(collection(db, "races"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// -----------------------------
// 切り替えスイッチ
// -----------------------------
type DataSource = "firebase" | "json" | "individual" | "scraper";
const dataSource = (process.env.DATA_SOURCE as DataSource) || "json";

// -----------------------------
// 公開 API（ここだけ使えばOK）
// -----------------------------
export async function getRace(id: string): Promise<Race | null> {
    switch (dataSource) {
        case "firebase":
            return getRaceFromFirestore(id) as Promise<Race | null>;
        case "individual":
            return getRaceFromIndividualJson(id);
        case "scraper":
            return getRaceFromScraperData(id);
        case "json":
        default:
            return getRaceFromJson(id);
    }
}

export async function getAllRaces(): Promise<Race[]> {
    switch (dataSource) {
        case "firebase":
            return getAllRacesFromFirestore() as Promise<Race[]>;
        case "individual":
            return getAllRacesFromIndividualJson();
        case "scraper":
            return getAllRacesFromScraperData();
        case "json":
        default:
            return getAllRacesFromJson();
    }
}
