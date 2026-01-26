export type BetType =
    | "単勝"
    | "複勝"
    | "馬連"
    | "馬単"
    | "ワイド"
    | "3連複"
    | "3連単";

export type NagashiSelectorValue = {
    axis: number | number[] | null;
    opponents: number[];
};
