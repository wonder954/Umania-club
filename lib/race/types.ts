// --- Firestore に保存される Race の正規形 ---
export type FirestoreRace = {
    id: string; // raceId と同じ

    // --- 基本情報（フェーズ1〜3で常に存在） ---
    date: string;          // "2026-03-07"
    place: string;         // "中山"
    title: string;         // "中山牝馬S"
    grade: string | null;  // "GⅢ"
    distance: number;      // 1800
    surface: string;       // "芝"
    direction: string | null;     // "右"
    courseDetail: string | null;  // null or "外回り"
    weightType: string | null;    // "ハンデ" など
    raceNumber: string;           // "11R"
    placeDetail: string | null;   // "2回中山3日"
    videoId: string | null;       // YouTube ID

    // --- 出走馬（フェーズ1〜2で存在、フェーズ3では空配列） ---
    entries: RaceEntry[];

    // --- 結果（フェーズ3で存在、フェーズ1〜2では null） ---
    result: RaceResult | null;
};

// --- 出走馬（フェーズ1〜2 の情報をすべて許容） ---
export type RaceEntry = {
    frame: number | null;   // 枠番（フェーズ2で確定）
    number: number | null;  // 馬番（フェーズ2で確定）
    name: string;           // 馬名（フェーズ1から存在）

    sex?: string;           // 性別（フェーズ1から存在）
    age?: number;           // 年齢（フェーズ1から存在）

    jockey?: string;        // 騎手（フェーズ2で確定）
    weight?: number | string; // 斤量（フェーズ2で確定）
    odds?: number;          // オッズ（フェーズ2で確定）
    popular?: number;       // 人気（フェーズ2で確定）
};

// --- 結果（フェーズ3） ---
export type RaceResult = {
    order: RaceOrder[];
    payout: RacePayout | null;
};

// --- 着順 ---
export type RaceOrder = {
    rank: number;
    frame: number;
    number: number;
    name: string;
    time: string;
    margin: string;
    jockey: string;
    weight: string;
    popular: number;
    odds: number;
};

// --- 払戻 ---
export type RacePayout = {
    win?: PayoutItem[];
    place?: PayoutItem[];
    quinella?: PayoutItem[];
    wide?: PayoutItem[];
    exacta?: PayoutItem[];
    trio?: PayoutItem[];
    trifecta?: PayoutItem[];
    bracket?: PayoutItem[];
};

export type PayoutItem = {
    numbers: number[];
    amount: number;
    popular: number;
};