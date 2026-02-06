// lib/races.ts

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RaceData, Entry } from "@/types/race";

// -----------------------------
// 型定義
// -----------------------------
export type Race = {
    id: string;
    name: string;
    date: string;
    place?: string;
    raceNumber?: string;
    course: {
        surface: string;
        distance: string;
        direction: string;
        courseDetail?: string | null;
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
// スクレイパーデータフォルダ関連
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
 * 最新の f フォルダを取得（今週のレース用）
 */
async function getLatestFFolder(): Promise<string | null> {
    const folders = await listScraperFolders();
    return folders.find(f => f.endsWith("f")) || null;
}

/**
 * 最新の w フォルダを取得（先週の結果用）
 */
async function getLatestWFolder(): Promise<string | null> {
    const folders = await listScraperFolders();
    return folders.find(f => f.endsWith("w")) || null;
}

/**
 * 特定フォルダからレースデータを読み込み
 */
async function loadRaceFromFolder(raceId: string, folderName: string): Promise<RaceData | null> {
    if (!isServer) return null;

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), SCRAPER_DATA_DIR, folderName, "races", `${raceId}.json`);

    if (!fs.existsSync(filePath)) return null;

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as RaceData;
    } catch (error) {
        console.error(`Failed to load race data: ${raceId} from ${folderName}`, error);
        return null;
    }
}

/**
 * RaceData → Race に変換
 */
function convertToRace(data: RaceData): Race {
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

// -----------------------------
// 公開 API
// -----------------------------

/**
 * 特定レースを取得（全フォルダを探索）
 */
export async function getRace(raceId: string): Promise<Race | null> {
    if (!isServer) return null;

    const folders = await listScraperFolders();

    for (const folder of folders) {
        const data = await loadRaceFromFolder(raceId, folder);
        if (data) {
            return convertToRace(data);
        }
    }

    return null;
}

/**
 * すべてのレースを取得
 * - 今週のレース: 最新の f フォルダ
 * - 先週の結果: 最新の w フォルダ
 */
export async function getAllRaces(): Promise<Race[]> {
    if (!isServer) return [];

    const fs = await import("fs");
    const path = await import("path");

    // 直近のフォルダを取得（予定・結果問わず、最新のものから順に確保）
    // fフォルダでもwフォルダでも、最新のものには今週の出馬表が含まれている可能性があるため
    // 過去1ヶ月分程度（約4-5週分）を含めるために上位6つを取得
    const allFolders = await listScraperFolders();
    const foldersToRead = allFolders.slice(0, 6);

    // 重複除去（latestF と wFolders[0] が同じ場合など）
    const uniqueFolders = Array.from(new Set(foldersToRead));

    console.log("[getAllRaces] Folders to read:", uniqueFolders);

    const races: Race[] = [];
    const seen = new Set<string>();

    for (const folder of uniqueFolders) {
        const racesDir = path.join(process.cwd(), SCRAPER_DATA_DIR, folder, "races");
        if (!fs.existsSync(racesDir)) continue;

        const files = fs.readdirSync(racesDir).filter(f => f.endsWith(".json"));

        for (const file of files) {
            const raceId = file.replace(".json", "");

            if (seen.has(raceId)) continue;
            seen.add(raceId);

            const data = await loadRaceFromFolder(raceId, folder);
            if (data) {
                races.push(convertToRace(data));
            }
        }
    }

    console.log(`[getAllRaces] Total races loaded: ${races.length}`);
    return races;
}