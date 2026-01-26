// utils/expandFormation.ts

export type Formation = {
    first: number[];
    second: number[];
    third?: number[]; // 3連単・3連複のみ
};

// BettingForm の Bet と互換にするため type は string にする
export type FormationBet = {
    type: string;
    mode: string;
    formation?: Formation; // ← optional にする
};

export function expandFormation(bet: FormationBet): number[][] {
    if (!bet.formation) return [];

    const { type, formation } = bet;
    const { first, second, third } = formation;

    // フォーメーション対象外の買い方は即 return []
    if (!["馬連", "馬単", "ワイド", "3連複", "3連単"].includes(type)) {
        return [];
    }

    // -------------------------
    // 3連単フォーメーション
    // -------------------------
    if (type === "3連単") {
        if (!first.length || !second.length || !third?.length) return [];

        const result: number[][] = [];

        first.forEach((f: number) => {
            second.forEach((s: number) => {
                third.forEach((t: number) => {
                    result.push([f, s, t]);
                });
            });
        });

        return result;
    }

    // -------------------------
    // 3連複フォーメーション（順不同）
    // -------------------------
    if (type === "3連複") {
        if (!first.length || !second.length || !third?.length) return [];

        const result: number[][] = [];

        first.forEach((f: number) => {
            second.forEach((s: number) => {
                third.forEach((t: number) => {
                    const combo = [f, s, t].sort((a, b) => a - b);
                    result.push(combo);
                });
            });
        });

        return Array.from(
            new Set(result.map((v) => JSON.stringify(v)))
        ).map((v) => JSON.parse(v) as number[]);
    }

    // -------------------------
    // 馬単フォーメーション（順番あり）
    // -------------------------
    if (type === "馬単") {
        if (!first.length || !second.length) return [];

        const result: number[][] = [];

        first.forEach((f: number) => {
            second.forEach((s: number) => {
                if (f !== s) {
                    result.push([f, s]);
                }
            });
        });

        return result;
    }

    // -------------------------
    // 馬連フォーメーション（順不同）
    // -------------------------
    if (type === "馬連") {
        if (!first.length || !second.length) return [];

        const result: number[][] = [];

        first.forEach((f: number) => {
            second.forEach((s: number) => {
                if (f !== s) {
                    const combo = [f, s].sort((a, b) => a - b);
                    result.push(combo);
                }
            });
        });

        return Array.from(
            new Set(result.map((v) => JSON.stringify(v)))
        ).map((v) => JSON.parse(v) as number[]);
    }

    // -------------------------
    // ワイドフォーメーション（順不同）
    // -------------------------
    if (type === "ワイド") {
        if (!first.length || !second.length) return [];

        const result: number[][] = [];

        first.forEach((f: number) => {
            second.forEach((s: number) => {
                if (f !== s) {
                    const combo = [f, s].sort((a, b) => a - b);
                    result.push(combo);
                }
            });
        });

        return Array.from(
            new Set(result.map((v) => JSON.stringify(v)))
        ).map((v) => JSON.parse(v) as number[]);
    }

    return [];
}