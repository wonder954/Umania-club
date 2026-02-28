// lib/races.ts

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RaceData, Entry } from "@/types/race";

// -----------------------------
// 型定義
// -----------------------------
export type Race = {
    id: string;                 // raceId
    name: string;               // レース名
    date: string;               // "2026-02-21"

    place: string | null;       // "東京"（regist で未取得のことがある）
    raceNumber: string | null;  // "11R"（regist で未取得のことがある）
    grade: string | null;       // "GIII" など
    placeDetail?: string | null;

    course: {
        surface: string | null;     // 芝 / ダート（未取得のことがある）
        distance: string | null;    // "3400m"（未取得のことがある）
        direction: string | null;   // 左 / 右（未取得のことがある）
        courseDetail?: string | null;
    };

    weightType?: string | null;

    /** 出馬表（entries） */
    horses: {
        frame: number | null;       // 枠番（null の場合あり）
        number: number | null;      // 馬番（null の場合あり）
        name: string;
        jockey?: string | null;
        weight?: string | number | null;
        odds?: number | null;
        popular?: number | null;
    }[];

    /** 結果（確定後のみ） */
    result: {
        order: {
            rank: number;             // 着順
            frame: number;
            number: number;
            name: string;
            time?: string | null;
            margin?: string | null;
            jockey?: string | null;
            weight?: string | number | null;
            popular?: number | null;
            odds?: number | null;
        }[];

        payout: {
            win?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
            place?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
            quinella?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
            wide?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
            exacta?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
            trio?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
            trifecta?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
            bracket?: {
                numbers: number[];
                amount: number;
                popular: number;
            }[];
        };
    } | null;

    createdAt?: any;
    updatedAt?: any;
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
        name: data.info.title.trim(),
        date: data.info.date,
        place: data.info.place,
        raceNumber: data.info.raceNumber ?? null,
        grade: data.info.grade ?? null,
        placeDetail: data.info.placeDetail ?? null,
        weightType: data.info.weightType ?? null,

        course: {
            surface: data.info.surface ?? null,
            distance: data.info.distance ?? null,
            direction: data.info.direction ?? null,
            courseDetail: data.info.courseDetail ?? null,
        },

        horses: (data.entries || data.result?.order || []).map((e: any) => ({
            frame: e.frame ?? null,
            number: e.number ?? null,
            name: e.name,
            jockey: e.jockey ?? null,
            weight: e.weight ?? null,
            odds: e.odds ?? null,
            popular: e.popular ?? null,
        })),

        result: data.result
            ? {
                order: data.result.order.map((o) => ({
                    rank: o.rank,
                    frame: o.frame,
                    number: o.number,
                    name: o.name,
                    time: o.time ?? null,
                    margin: o.margin ?? null,
                    jockey: o.jockey ?? null,
                    weight: o.weight ?? null,
                    popular: o.popular ?? null,
                    odds: o.odds ?? null,
                })),
                payout: data.result.payout,
            }
            : null,
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