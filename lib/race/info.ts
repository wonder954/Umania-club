/**
 * RaceInfo（スクレイピング生データ）
 * Yahoo! 競馬スクレイピング用
 * FirestoreRace に変換する前の中間モデル
 */
import type { RaceEntry, RaceOrder, RaceResult } from "./types";

// レース基本情報
export type RaceInfo = {
    date: string;                 // "2026-01-24"
    place: string | null;         // "中山"（regist で未取得のことがある）
    placeDetail?: string | null;  // "1回中山8日"
    title: string;                // "アメリカジョッキークラブカップ"
    grade: string | null;         // "GI" | "GII" | "GIII" | "J・GⅡ" | null
    raceNumber?: string | null;   // "11R"
    surface?: string | null;      // "芝" | "ダート"
    distance?: number | null;     // 2200
    direction?: string | null;    // "右" | "左"
    courseDetail?: string | null; // "外" | "内"
    weightType?: string | null;   // "別定" | "定量" | "ハンデ"
    videoId: string | null;
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

// RaceData（スクレイピング JSON の最終形）
export type RaceData = {
    raceId: string;
    info: RaceInfo;
    entries?: RaceEntry[];   // 出馬表 JSON のときだけ存在
    result?: RaceResult; // 結果 JSON のときだけ存在
};