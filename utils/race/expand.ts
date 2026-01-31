import type { Bet, BetType } from "@/types/bet";

export type ExpandedTicket = {
    type: BetType;
    numbers: number[];
};

export function expandTickets(bet: Bet): ExpandedTicket[] {
    const mode = bet.mode ?? "normal"; // ← ここで normal をデフォルトにする

    switch (mode) {
        case "normal":
            return expandNormal(bet);

        case "box":
            return expandBox(bet);

        case "formation":
            return expandFormation(bet);

        case "nagashi":
            return expandNagashi(bet);

        default:
            return expandNormal(bet); // ← default も normal にする
    }
}

// -------------------------
// normal（単純買い）
// -------------------------
function expandNormal(bet: Bet): ExpandedTicket[] {
    const nums = bet.numbers.map(Number);

    // 単勝・複勝は1頭ずつ1点
    if (bet.type === "単勝" || bet.type === "複勝") {
        return nums.map(n => ({
            type: bet.type,
            numbers: [n]
        }));
    }

    // その他はそのまま1点
    return [
        {
            type: bet.type,
            numbers: nums
        }
    ];
}

// -------------------------
// BOX
// -------------------------
function expandBox(bet: Bet): ExpandedTicket[] {
    const box = (bet.box ?? []).map(Number);
    const tickets: ExpandedTicket[] = [];

    if (bet.type === "馬連" || bet.type === "ワイド") {
        for (let i = 0; i < box.length; i++) {
            for (let j = i + 1; j < box.length; j++) {
                tickets.push({ type: bet.type, numbers: [box[i], box[j]] });
            }
        }
        return tickets;
    }

    if (bet.type === "3連複") {
        for (let i = 0; i < box.length; i++) {
            for (let j = i + 1; j < box.length; j++) {
                for (let k = j + 1; k < box.length; k++) {
                    tickets.push({
                        type: bet.type,
                        numbers: [box[i], box[j], box[k]].sort()
                    });
                }
            }
        }
        return tickets;
    }

    if (bet.type === "3連単") {
        const perms = permute(box, 3);
        return perms.map(p => ({
            type: bet.type,
            numbers: p
        }));
    }

    return tickets;
}

// -------------------------
// フォーメーション
// -------------------------
function expandFormation(bet: Bet): ExpandedTicket[] {
    const f = bet.formation;
    if (!f) return [];

    const first = f.first.map(Number);
    const second = f.second.map(Number);
    const third = f.third?.map(Number);

    const tickets: ExpandedTicket[] = [];

    if (bet.type === "馬連" || bet.type === "ワイド") {
        first.forEach(a => {
            second.forEach(b => {
                if (a !== b) {
                    tickets.push({ type: bet.type, numbers: [a, b] });
                }
            });
        });
        return tickets;
    }

    if (bet.type === "馬単") {
        first.forEach(a => {
            second.forEach(b => {
                if (a !== b) {
                    tickets.push({ type: bet.type, numbers: [a, b] });
                }
            });
        });
        return tickets;
    }

    if (bet.type === "3連複" && third) {
        first.forEach(a => {
            second.forEach(b => {
                third.forEach(c => {
                    const arr = [a, b, c];
                    if (new Set(arr).size === 3) {
                        tickets.push({
                            type: bet.type,
                            numbers: arr.sort()
                        });
                    }
                });
            });
        });
        return tickets;
    }

    if (bet.type === "3連単" && third) {
        first.forEach(a => {
            second.forEach(b => {
                third.forEach(c => {
                    if (new Set([a, b, c]).size === 3) {
                        tickets.push({
                            type: bet.type,
                            numbers: [a, b, c]
                        });
                    }
                });
            });
        });
        return tickets;
    }

    return tickets;
}

// -------------------------
// 流し
// -------------------------
function expandNagashi(bet: Bet): ExpandedTicket[] {
    if (bet.trifectaNagashi) {
        return expandTrifectaNagashi(bet);
    }

    const axis = (bet.axis ?? []).map(Number);
    const wings = (bet.wings ?? []).map(Number);

    const tickets: ExpandedTicket[] = [];

    if (bet.type === "馬連" || bet.type === "ワイド") {
        axis.forEach(a => {
            wings.forEach(b => {
                if (a !== b) {
                    tickets.push({ type: bet.type, numbers: [a, b] });
                }
            });
        });
        return tickets;
    }

    if (bet.type === "馬単") {
        axis.forEach(a => {
            wings.forEach(b => {
                if (a !== b) {
                    tickets.push({ type: bet.type, numbers: [a, b] });
                }
            });
        });
        return tickets;
    }

    if (bet.type === "3連複") {
        axis.forEach(a => {
            for (let i = 0; i < wings.length; i++) {
                for (let j = i + 1; j < wings.length; j++) {
                    const arr = [a, wings[i], wings[j]];
                    if (new Set(arr).size === 3) {
                        tickets.push({
                            type: bet.type,
                            numbers: arr.sort()
                        });
                    }
                }
            }
        });
        return tickets;
    }

    if (bet.type === "3連単") {
        axis.forEach(a => {
            wings.forEach(b => {
                wings.forEach(c => {
                    if (new Set([a, b, c]).size === 3) {
                        tickets.push({
                            type: bet.type,
                            numbers: [a, b, c]
                        });
                    }
                });
            });
        });
        return tickets;
    }

    return tickets;
}

// -------------------------
// 3連単特殊流し
// -------------------------
function expandTrifectaNagashi(bet: Bet): ExpandedTicket[] {
    const t = bet.trifectaNagashi!;
    const wings = t.wings.map(Number);

    const firsts = t.pattern.includes("1") ? [t.first!] : wings;
    const seconds = t.pattern.includes("2") ? [t.second!] : wings;
    const thirds = t.pattern.includes("3") ? [t.third!] : wings;

    const tickets: ExpandedTicket[] = [];

    firsts.forEach(a => {
        seconds.forEach(b => {
            thirds.forEach(c => {
                if (new Set([a, b, c]).size === 3) {
                    tickets.push({
                        type: "3連単",
                        numbers: [a, b, c]
                    });
                }
            });
        });
    });

    return tickets;
}

// -------------------------
// 順列生成（3連単BOX用）
// -------------------------
function permute(arr: number[], size: number): number[][] {
    const result: number[][] = [];

    function dfs(path: number[], used: boolean[]) {
        if (path.length === size) {
            result.push([...path]);
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.push(arr[i]);
            dfs(path, used);
            path.pop();
            used[i] = false;
        }
    }

    dfs([], Array(arr.length).fill(false));
    return result;
}