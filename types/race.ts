/**
 * レースデータ型定義
 * Yahoo! 競馬スクレイピング用
 */

// レース基本情報
export type RaceInfo = {
    date: string;           // "2026-01-24"
    place: string;          // "中山"
    placeDetail?: string;   // "1回中山8日"
    title: string;          // "アメリカジョッキークラブカップ"
    grade: string;          // "GI" | "GII" | "GIII"
    raceNumber?: string;    // "11R"
    surface?: string;       // "芝" | "ダート"
    distance?: string;      // 2200
    direction?: string;     // "右" | "左"
    courseDetail?: string;  // "外" | "内"
    weightType?: string;    // "別定" | "定量" | "ハンデ"
};

// 出馬表エントリ
export type Entry = {
    number: number | null;  // 馬番（regist では null）
    frame: number | null;   // 枠番（regist では null）
    name: string;           // 馬名
    sex?: string;           // "牡" | "牝" | "セ"
    age?: number;           // 4
    weight?: number;        // 斤量 57.0
    jockey?: string;        // 騎手名
    odds?: number;          // 単勝オッズ
    popular?: number;       // 人気
};

// 着順データ
export type RaceOrder = {
    rank: number;           // 着順
    frame: number;          // 枠番
    number: number;         // 馬番
    name: string;           // 馬名
    time: string;           // タイム "1:58.1"
    margin: string;         // 着差 "-" | "クビ" | "1/2"
    jockey: string;         // 騎手名
    weight: string;         // 斤量 "54.0"
    popular: number;        // 人気
    odds: number;           // オッズ
};

// 払戻金アイテム
export type PayoutItem = {
    numbers: number[];      // 組番号 [16, 17]
    amount: number;         // 払戻金額 4470
    popular: number;        // 人気
};

// 払戻金全体
export type Payout = {
    win: PayoutItem[];      // 単勝
    place: PayoutItem[];    // 複勝
    bracket?: PayoutItem[]; // 枠連（ない場合あり）
    quinella: PayoutItem[]; // 馬連
    wide: PayoutItem[];     // ワイド
    exacta: PayoutItem[];   // 馬単
    trio: PayoutItem[];     // 3連複
    trifecta: PayoutItem[]; // 3連単
};

// レース結果
export type RaceResult = {
    order: RaceOrder[];
    payout: Payout;
};

// 完全なレースデータ
export type RaceData = {
    raceId: string;
    info: RaceInfo;
    entries?: Entry[];
    result?: RaceResult;
};

// 重賞一覧アイテム（fetchWeeklyRacesYahoo の戻り値）
export type RaceListItem = {
    raceId: string;
    title: string;
    grade: string;
    detailUrl: string;
    surface?: string;
    direction?: string;
    courseDetail?: string;
    distance?: string;
    weightType?: string;
    date?: string;
};

export type Race = {
    id: string;
    name: string;
    grade: "G1" | "G2" | "G3" | "OP" | "None";
    date: string; // "2025-01-25"
};
