// 単一選択（同じなら解除）
export function toggleSingle(current: number | null, value: number): number | null {
    return current === value ? null : value;
}

// 複数選択
export function toggleMulti(list: number[], value: number): number[] {
    return list.includes(value)
        ? list.filter(n => n !== value)
        : [...list, value].sort((a, b) => a - b);
}

// 最大数制限付き（Box 用）
export function toggleMultiWithLimit(list: number[], value: number, max: number): number[] {
    if (list.includes(value)) return list.filter(n => n !== value);
    if (list.length >= max) return list;
    return [...list, value].sort((a, b) => a - b);
}

// 総流し
export function toggleAll(current: number[], all: number[]): number[] {
    return current.length === all.length ? [] : all;
}