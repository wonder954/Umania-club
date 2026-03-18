export function safeSelectors<T>(sel: T): T {
    return JSON.parse(JSON.stringify(sel));
}