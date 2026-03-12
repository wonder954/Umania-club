import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { RaceData, Entry } from '../../types/race';

// ESM で __dirname を再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// スクレイパーのデータディレクトリ（scripts/scraper/data）
const SCRAPER_DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * 保存オプション
 */
export type SaveOptions = {
    skipIfExists?: {
        entries?: boolean;  // true: 既存 entries があれば上書きしない
        result?: boolean;   // true: 既存 result があれば上書きしない
    };
};

/**
 * フォルダ名を生成（例: 20260129w, 20260130f）
 */
export function generateFolderName(type: 'w' | 'f'): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}${type}`;
}

/**
 * 日付フォルダ一覧を取得（降順ソート）
 */
export function listRaceFolders(): string[] {
    if (!fs.existsSync(SCRAPER_DATA_DIR)) {
        return [];
    }

    const entries = fs.readdirSync(SCRAPER_DATA_DIR, { withFileTypes: true });
    const folders = entries
        .filter(e => e.isDirectory() && /^\d{8}[wf]$/.test(e.name))
        .map(e => e.name)
        .sort((a, b) => b.localeCompare(a)); // 降順

    return folders;
}

/**
 * 最新のレースフォルダを取得
 */
export function getLatestRaceFolder(): string | null {
    const folders = listRaceFolders();
    return folders.length > 0 ? folders[0] : null;
}

/**
 * 最新の1つ前のレースフォルダを取得
 */
export function getPreviousRaceFolder(): string | null {
    const folders = listRaceFolders();
    return folders.length > 1 ? folders[1] : null;
}

/**
 * 特定のタイプ(w/f)の最新フォルダを取得
 */
export function getLatestFolderByType(type: 'w' | 'f'): string | null {
    const folders = listRaceFolders().filter(f => f.endsWith(type));
    return folders.length > 0 ? folders[0] : null;
}

/**
 * フォルダパスを取得
 */
function getRacesFolderPath(folderName: string): string {
    return path.join(SCRAPER_DATA_DIR, folderName, 'races');
}

/**
 * フォルダが存在しない場合は作成
 */
function ensureFolderExists(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created directory: ${folderPath}`);
    }
}

/**
 * レースデータを読み込む（特定フォルダから）
 */
export function loadRaceData(raceId: string, folderName?: string): RaceData | null {
    // フォルダ名が指定されていない場合は最新フォルダを使用
    const targetFolder = folderName || getLatestRaceFolder();
    if (!targetFolder) {
        return null;
    }

    const folderPath = getRacesFolderPath(targetFolder);
    const filePath = path.join(folderPath, `${raceId}.json`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as RaceData;
    } catch (error) {
        console.error(`Failed to load race data: ${raceId} from ${targetFolder}`, error);
        return null;
    }
}

/**
 * 前週のフォルダから entries を読み込む
 */
export function loadPreviousWeekEntries(raceId: string): Entry[] | null {
    const prevFolder = getPreviousRaceFolder();
    if (!prevFolder) {
        return null;
    }

    const data = loadRaceData(raceId, prevFolder);
    return data?.entries || null;
}

/**
 * レースデータを保存（差分更新対応、フォルダ指定）
 * 
 * @param raceId - レースID
 * @param partialData - 更新するデータ（部分的でOK）
 * @param folderName - 保存先フォルダ名（例: "20260129w"）
 * @param options - 保存オプション
 */
export function saveRaceData(
    raceId: string,
    partialData: Partial<RaceData>,
    folderName: string,
    options?: SaveOptions
): void {
    const folderPath = getRacesFolderPath(folderName);
    ensureFolderExists(folderPath);

    const filePath = path.join(folderPath, `${raceId}.json`);

    // 既存データを読み込み
    let existingData: RaceData = {
        raceId,
        info: {
            date: '',
            place: '',
            title: '',
            grade: '',
            distance: null,
            surface: null,
            direction: null,
            courseDetail: null,
            weightType: null,
            raceNumber: null,
            placeDetail: null,
            videoId: '',
        },
    };

    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            existingData = JSON.parse(content) as RaceData;
        } catch {
            console.warn(`Failed to parse existing file, will overwrite: ${filePath}`);
        }
    }

    // マージロジック
    const newData: RaceData = {
        ...existingData,
        raceId,
    };

    // info はマージ（全てのフィールドを確実に含める）
    if (partialData.info) {
        newData.info = {
            ...existingData.info,  // 既存のデータ
            ...partialData.info,   // 新しいデータで上書き
        };

        // デバッグ: どのフィールドが含まれているか確認
        console.log(`Merging info for ${raceId}:`, {
            existing: existingData.info,
            new: partialData.info,
            merged: newData.info,
        });
    }

    // entries の処理
    if (partialData.entries !== undefined) {
        if (options?.skipIfExists?.entries && existingData.entries && existingData.entries.length > 0) {
            console.log(`Skipping entries update (existing data preserved): ${raceId}`);
        } else {
            newData.entries = partialData.entries;
        }
    }

    // result の処理
    if (partialData.result !== undefined) {
        if (options?.skipIfExists?.result && existingData.result) {
            console.log(`Skipping result update (existing data preserved): ${raceId}`);
        } else {
            newData.result = partialData.result;
        }
    }

    // 保存前の最終確認
    console.log(`Final data to save for ${raceId}:`, JSON.stringify(newData.info, null, 2));

    // 保存
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
    console.log(`Saved race data: ${filePath}`);
}

/**
 * 特定フォルダの全レースデータを取得
 */
export function loadAllRaceData(folderName?: string): RaceData[] {
    const targetFolder = folderName || getLatestRaceFolder();
    if (!targetFolder) {
        return [];
    }

    const folderPath = getRacesFolderPath(targetFolder);
    if (!fs.existsSync(folderPath)) {
        return [];
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));

    return files.map(file => {
        const content = fs.readFileSync(path.join(folderPath, file), 'utf-8');
        return JSON.parse(content) as RaceData;
    });
}

/**
 * 全フォルダから特定レースIDのデータを検索
 */
export function findRaceDataAcrossFolders(raceId: string): { folder: string; data: RaceData } | null {
    const folders = listRaceFolders();

    for (const folder of folders) {
        const data = loadRaceData(raceId, folder);
        if (data) {
            return { folder, data };
        }
    }

    return null;
}