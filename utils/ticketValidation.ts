// utils/ticketValidation.ts (新規作成)

import { Ticket2, Ticket3 } from "@/types/bet";

/**
 * 2頭の券が有効かチェック(同じ馬がいないか)
 */
export function isValidTicket2([a, b]: Ticket2): boolean {
    return a !== b;
}

/**
 * 3頭の券が有効かチェック(同じ馬がいないか)
 */
export function isValidTicket3([a, b, c]: Ticket3): boolean {
    return a !== b && b !== c && a !== c;
}

/**
 * 順序なし馬券の正規化(馬連・ワイド)
 */
export function normalizeUnordered2([a, b]: Ticket2): Ticket2 {
    return a < b ? [a, b] : [b, a];
}

/**
 * 順序なし馬券の正規化(三連複)
 */
export function normalizeUnordered3([a, b, c]: Ticket3): Ticket3 {
    const arr = [a, b, c].sort((x, y) => x - y);
    return [arr[0], arr[1], arr[2]];
}

/**
 * 券の配列を一意化(重複除去)
 */
export function uniqueTickets<T extends number[]>(tickets: T[]): T[] {
    const keySet = new Set<string>();
    const result: T[] = [];

    for (const ticket of tickets) {
        const key = ticket.join('-');
        if (!keySet.has(key)) {
            keySet.add(key);
            result.push(ticket);
        }
    }

    return result;
}