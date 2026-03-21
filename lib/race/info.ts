/**
 * RaceInfo（スクレイピング生データ）
 * Yahoo! 競馬スクレイピング用
 * FirestoreRace に変換する前の中間モデル
 */

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

// 出馬表エントリ（出馬表 JSON のときだけ存在）
export type Entry = {
    number: number | null;
    frame: number | null;
    name: string;

    sex?: string | null;
    age?: number | null;
    weight?: number | string | null;
    jockey?: string | null;
};

// 着順データ（結果 JSON のときだけ存在）
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

// レース結果（結果 JSON のときだけ存在）
export type RaceResult = {
    order: RaceOrder[];
    payout: Payout;
} | null;

// RaceData（スクレイピング JSON の最終形）
export type RaceData = {
    raceId: string;
    info: RaceInfo;
    entries?: Entry[];   // 出馬表 JSON のときだけ存在
    result?: RaceResult; // 結果 JSON のときだけ存在
};