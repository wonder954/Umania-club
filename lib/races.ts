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
        distance: string;      // 2200
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
 * スクレイパーフォルダ一覧を取得（降順ソート）
 */
async function listScraperFolders(): Promise<string[]> {
    if (!isServer) return [];

    const fs = await import("fs");
    const path = await import("path");
    const dirPath = path.join(process.cwd(), SCRAPER_DATA_DIR);

    if (!fs.existsSync(dirPath)) return [];

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    return entries
        .filter(e => e.isDirectory() && /^\d{8}[wf]$/.test(e.name))
        .map(e => e.name)
        .sort((a, b) => b.localeCompare(a)); // 降順
}

/**
 * 最新日付を取得（entries 用）
 */
async function getLatestDate(): Promise<string | null> {
    const folders = await listScraperFolders();
    if (folders.length === 0) return null;

    // 日付だけ取り出す
    const dates = folders.map(f => f.slice(0, 8));

    // 重複排除（Set を使わない）
    const uniqueDates = dates.filter((d, i) => dates.indexOf(d) === i);

    uniqueDates.sort(); // 昇順
    return uniqueDates[uniqueDates.length - 1]; // 最新日付
}
/**
 * 最新日付のフォルダ一覧（entries 用）
 */
async function getEntryFoldersForLatestDate(): Promise<string[]> {
    const folders = await listScraperFolders();
    const latestDate = await getLatestDate();
    if (!latestDate) return [];

    return folders.filter(f => f.startsWith(latestDate));
}

/**
 * 最新日付の出馬表フォルダ（f 優先）
 */
async function getLatestEntriesFolder(): Promise<string | null> {
    const sameDate = await getEntryFoldersForLatestDate();
    if (sameDate.length === 0) return null;

    const friday = sameDate.find(f => f.endsWith("f"));
    return friday || sameDate[0];
}

/**
 * 最新 w 日付を取得（result 用）
 */
async function getLatestWDate(): Promise<string | null> {
    const folders = await listScraperFolders();

    // w の日付だけ取り出す
    const dates = folders
        .filter(f => f.endsWith("w"))
        .map(f => f.slice(0, 8));

    // 重複排除（Set を使わない）
    const uniqueDates = dates.filter((d, i) => dates.indexOf(d) === i);

    if (uniqueDates.length === 0) return null;

    uniqueDates.sort(); // 昇順
    return uniqueDates[uniqueDates.length - 1]; // 最新の w 日付
}

/**
 * 最新 w 日付のフォルダ（result 用）
 */
async function getLatestResultFolder(): Promise<string | null> {
    const folders = await listScraperFolders();
    const latestWDate = await getLatestWDate();
    if (!latestWDate) return null;

    return folders.find(f => f.startsWith(latestWDate) && f.endsWith("w")) || null;
}

/**
 * スクレイパーフォルダからレースデータを読み込み
 */
async function loadRaceFromScraperFolder(raceId: string, folderName: string): Promise<RaceData | null> {
    if (!isServer) return null;

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), SCRAPER_DATA_DIR, folderName, "races", `${raceId}.json`);

    if (!fs.existsSync(filePath)) return null;

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as RaceData;
    } catch (error) {
        console.error(`Failed to load race data from scraper folder: ${raceId}`, error);
        return null;
    }
}

/**
 * 最新 w 日付のフォルダから entries を読み込む（結果補完用）
 */
export async function loadLatestWEntries(raceId: string): Promise<Entry[] | null> {
    const folder = await getLatestResultFolder();
    if (!folder) return null;

    const data = await loadRaceFromScraperFolder(raceId, folder);
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
    if (!isServer) return getRaceFromJson(raceId);

    // 出馬表フォルダ（最新日付）を f → w の順に並べる
    const entryFolders = (await getEntryFoldersForLatestDate()).sort((a, b) => {
        if (a.endsWith("f") && b.endsWith("w")) return -1;
        if (a.endsWith("w") && b.endsWith("f")) return 1;
        return 0;
    });

    // 結果フォルダ（最新 w）
    const resultFolder = await getLatestResultFolder();

    const foldersToTry = [
        ...entryFolders,
        ...(resultFolder ? [resultFolder] : [])
    ];

    let data: RaceData | null = null;

    for (const folder of foldersToTry) {
        data = await loadRaceFromScraperFolder(raceId, folder);
        if (data) break;
    }

    if (!data) return getRaceFromJson(raceId);

    return {
        id: data.raceId,
        name: data.info.title,
        date: data.info.date,
        place: data.info.place,
        raceNumber: data.info.raceNumber,
        course: {
            surface: data.info.surface || "",
            distance: data.info.distance || "",
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
    if (!isServer) return getAllRacesFromJson();

    const fs = await import("fs");
    const path = await import("path");

    // 出馬表用：最新日付のフォルダ群（f → w の順に並べる）
    const entryFolders = (await getEntryFoldersForLatestDate()).sort((a, b) => {
        if (a.endsWith("f") && b.endsWith("w")) return -1;
        if (a.endsWith("w") && b.endsWith("f")) return 1;
        return 0;
    });
    console.log("[lib/races] Entry folders:", entryFolders);

    // 結果用：最新 w 日付のフォルダ（1つ）
    const resultFolder = await getLatestResultFolder();
    console.log("[lib/races] Result folder:", resultFolder);

    // 重複を避けて配列化
    const foldersToRead = [
        ...entryFolders,
        ...(resultFolder ? [resultFolder] : [])
    ];
    console.log("[lib/races] Folders to read:", foldersToRead);

    const races: Race[] = [];
    const seen = new Set<string>(); // raceId の重複防止

    for (const folder of foldersToRead) {
        const folderPath = path.join(process.cwd(), SCRAPER_DATA_DIR, folder, "races");

        if (!fs.existsSync(folderPath)) continue;

        const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
        for (const file of files) {
            const raceId = file.replace(".json", "");

            // 同じレースを複数回 push しない
            if (seen.has(raceId)) continue;
            seen.add(raceId);

            const race = await getRaceFromScraperData(raceId);
            if (race) races.push(race);
        }
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
        case "scraper":
            return getRaceFromScraperData(id);
        case "json":
        default:
            return getRaceFromJson(id); // フォールバック（空実装でOK）
    }
}

export async function getAllRaces(): Promise<Race[]> {
    switch (dataSource) {
        case "firebase":
            return getAllRacesFromFirestore() as Promise<Race[]>;
        case "scraper":
            return getAllRacesFromScraperData();
        case "json":
        default:
            return getAllRacesFromJson(); // フォールバック（空実装でOK）
    }
}