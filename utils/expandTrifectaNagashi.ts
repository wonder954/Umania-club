// 3連単流しのパターン型
export type TrifectaPattern = "1" | "2" | "3" | "12" | "13" | "23";

// 入力データの型
export type TrifectaNagashiInput = {
    pattern: TrifectaPattern;
    first: number | null;
    second: number | null;
    third: number | null;
    wings: number[];
};

// 展開結果は [1着, 2着, 3着] の配列
export type TrifectaResult = [number, number, number];


// ★ 3連単流しの展開
export function expandTrifectaNagashi({
    pattern,
    first,
    second,
    third,
    wings,
}: TrifectaNagashiInput): TrifectaResult[] {
    const results: TrifectaResult[] = [];

    if (pattern === "1" && first !== null) {
        wings.forEach((w2) => {
            wings.forEach((w3) => {
                if (w2 !== w3) results.push([first, w2, w3]);
            });
        });
    }

    if (pattern === "2" && second !== null) {
        wings.forEach((w1) => {
            wings.forEach((w3) => {
                if (w1 !== w3) results.push([w1, second, w3]);
            });
        });
    }

    if (pattern === "3" && third !== null) {
        wings.forEach((w1) => {
            wings.forEach((w2) => {
                if (w1 !== w2) results.push([w1, w2, third]);
            });
        });
    }

    if (pattern === "12" && first !== null && second !== null) {
        wings.forEach((w3) => results.push([first, second, w3]));
    }

    if (pattern === "13" && first !== null && third !== null) {
        wings.forEach((w2) => results.push([first, w2, third]));
    }

    if (pattern === "23" && second !== null && third !== null) {
        wings.forEach((w1) => results.push([w1, second, third]));
    }

    return results;
}


// ★ 3連単マルチ用の6通り展開
export function perm6([a, b, c]: TrifectaResult): TrifectaResult[] {
    return [
        [a, b, c],
        [a, c, b],
        [b, a, c],
        [b, c, a],
        [c, a, b],
        [c, b, a],
    ];
}