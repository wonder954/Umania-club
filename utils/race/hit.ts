export function isHitSingleTicket(
    type: string,
    numbers: number[],
    order: number[]
): boolean {
    const top = order;

    switch (type) {
        case "単勝":
            return numbers[0] === top[0];

        case "複勝":
            return top.slice(0, 3).includes(numbers[0]);

        case "馬連":
            return [...numbers].sort().join('-') === [top[0], top[1]].sort().join('-');

        case "馬単":
            return numbers[0] === top[0] && numbers[1] === top[1];

        case "ワイド": {
            const pick = [...numbers].sort();
            const actual = [top[0], top[1], top[2]];
            return actual.includes(pick[0]) && actual.includes(pick[1]);
        }

        case "3連複":
            return [...numbers].sort().join('-') === [top[0], top[1], top[2]].sort().join('-');

        case "3連単":
            return (
                numbers[0] === top[0] &&
                numbers[1] === top[1] &&
                numbers[2] === top[2]
            );

        default:
            return false;
    }
}