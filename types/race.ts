/**
 * レースデータ型定義
 * Yahoo! 競馬スクレイピング用
 */

import type { GradeStyle } from "@/utils/race/raceGradeUtils";

// レース基本情報
export type RaceInfo = {
    date: string;                 // "2026-01-24"
    place: string | null;         // "中山"（regist で未取得のことがある）
    placeDetail?: string | null;  // "1回中山8日"
    title: string;                // "アメリカジョッキークラブカップ"
    grade: string | null;         // "GI" | "GII" | "GIII" | null
    raceNumber?: string | null;   // "11R"
    surface?: string | null;      // "芝" | "ダート"
    distance?: number | null;     // "2200"
    direction?: string | null;    // "右" | "左"
    courseDetail?: string | null; // "外" | "内"
    weightType?: string | null;   // "別定" | "定量" | "ハンデ"
};

// 出馬表エントリ
export type Entry = {
    number: number | null;
    frame: number | null;
    name: string;

    sex?: string | null;
    age?: number | null;
    weight?: number | string | null;
    jockey?: string | null;
    odds?: number | null;
    popular?: number | null;
};

// 着順データ
export type RaceOrder = {
    rank: number;
    frame: number;
    number: number;
    name: string;

    time?: string | null;
    margin?: string | null;

    jockey?: string | null;
    weight?: string | number | null;
    popular?: number | null;
    odds?: number | null;
};

// 払戻金アイテム
export type PayoutItem = {
    numbers: number[];
    amount: number;
    popular: number;
};

// 払戻金全体
export type Payout = {
    win?: PayoutItem[];
    place?: PayoutItem[];
    bracket?: PayoutItem[];
    quinella?: PayoutItem[];
    wide?: PayoutItem[];
    exacta?: PayoutItem[];
    trio?: PayoutItem[];
    trifecta?: PayoutItem[];
};

// レース結果
export type RaceResult = {
    order: RaceOrder[];
    payout: Payout;
} | null;

// JSON 保存用
export type RaceData = {
    raceId: string;
    info: RaceInfo;
    entries?: Entry[];
    result?: RaceResult;
};

// ===============================
// 今週の重賞一覧（detailUrl を持つ）
// ===============================
export type RaceListItem = {
    raceId: string;
    title: string;
    grade: string | null;
    detailUrl: string;          // ← 今週は detailUrl
    surface?: string | null;
    direction?: string | null;
    courseDetail?: string | null;
    distance?: string | null;
    weightType?: string | null;
    date?: string | null;
};

// ===============================
// 先週の重賞一覧（resultUrl を持つ）
// ===============================
export type LastWeekRaceItem = {
    raceId: string;
    title: string;
    grade: string | null;
    resultUrl: string;          // ← 先週は resultUrl
};

export type CalendarRace = {
    id: string;
    name: string;
    raceName?: string;     // GII を除いた純粋なレース名
    grade: "G1" | "G2" | "G3" | "JG1" | "JG2" | "JG3" | "OP" | string;
    date: string;
    color: GradeStyle;     // ← string を廃止して GradeStyle に統一
    isWeak?: boolean;      // ← 薄い色にするかどうか
};