// --- Firestore に保存される Race の正規形 ---
// normalizeRace() の出力そのもの。
// Firestore は undefined を保存できないため、
// すべての optional フィールドは null を許容する形に統一している。
export type FirestoreRace = {
    id: string; // raceId と同じ

    // --- 基本情報（フェーズ1〜3で常に存在） ---
    date: string;               // "2026-03-07"
    place: string;              // "中山"
    title: string;              // "中山牝馬S"
    grade: string | null;       // "GⅢ" / null
    distance: number;           // 1800
    surface: string;            // "芝"
    direction: string | null;   // "右" / null
    courseDetail: string | null;// "外回り" / null
    weightType: string | null;  // "ハンデ" / null
    raceNumber: string;         // "11R"
    placeDetail: string | null; // "2回中山3日" / null
    videoId: string | null;     // YouTube ID / null
    name: string | null;        // JRA の正式名称（"中山牝馬ステークス" など）

    // --- 出走馬（フェーズ1〜2で存在、フェーズ3では空配列） ---
    entries: RaceEntry[];

    // ★ run-Odds が保存するフィールド
    oddsEntries?: {
        number: number;
        odds: number | null;
        popular: number | null;
    }[];

    // --- 結果（フェーズ3で存在、フェーズ1〜2では null） ---
    result: RaceResult | null;
};



// --- 出走馬（フェーズ1〜2 の情報をすべて許容） ---
// Firestore 互換のため undefined は禁止、null を許可。
export type RaceEntry = {
    frame: number | null;   // 枠番（フェーズ2で確定）
    number: number | null;  // 馬番（フェーズ2で確定）
    name: string;           // 馬名（フェーズ1から存在）

    sex: string | null;     // 性別（牡/牝/セ）/ null
    age: number | null;     // 年齢 / null

    jockey: string | null;  // 騎手名 / null
    weight: number | null;
    odds: number | null;     // ← 追加
    popular: number | null;   // 斤量（"56" など）/ null
};



// --- 結果（フェーズ3） ---
// payout は null の可能性がある（地方競馬など）
export type RaceResult = {
    order: RaceOrder[];
    payout: RacePayout | null;
};



// --- 着順 ---
// Firestore 互換のため undefined は禁止、null を許可。
export type RaceOrder = {
    rank: number;           // 着順（1〜18）
    frame: number;          // 枠番
    number: number;         // 馬番
    name: string;           // 馬名

    time: string | null;    // 走破タイム / null
    margin: string | null;  // 着差 / null
    jockey: string | null;  // 騎手名 / null
    weight: number | null;  // 斤量（"56" など）/ null
    popular: number | null; // 人気 / null
    odds: number | null;    // オッズ / null
};



// --- 払戻 ---
// 各券種は存在しない場合があるため optional。
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
    numbers: number[];  // 組番
    amount: number;     // 払戻金
    popular: number;    // 人気順
};