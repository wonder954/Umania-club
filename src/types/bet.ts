export type BetType =
    | "単勝"
    | "複勝"
    | "馬連"
    | "馬単"
    | "ワイド"
    | "3連複"
    | "3連単";


export type InputMode = "box" | "formation" | "nagashi";
export type TrifectaPattern = "1" | "2" | "3" | "12" | "13" | "23";

export type Bet = {
    id: string;
    type: BetType;
    mode: InputMode | null;  // null = 通常買い（1点買い）
    isMulti?: boolean;
    numbers: number[];

    // ボックス
    box?: number[];

    // 流し（通常）
    axis?: number[];
    wings?: number[];

    // 3連単流し（特殊）
    trifectaNagashi?: {
        pattern: TrifectaPattern;
        first: number | null;
        second: number | null;
        third: number | null;
        wings: number[];
    };

    // フォーメーション
    formation?: {
        first: number[];
        second: number[];
        third: number[];
    };

    points: number;
};

export type NagashiSelectorValue = {
    axis: number | number[] | null;
    opponents: number[];
};

export type Ticket2 = [number, number];        // 馬連・馬単・ワイド
export type Ticket3 = [number, number, number]; // 三連複・三連単