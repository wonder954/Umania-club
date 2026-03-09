// scripts/utils/raceUtils.ts
export function cleanTitle(name: string): string {
    return name
        .replace(/（[^）]+）/g, '')
        .replace(/\([^)]+\)/g, '')
        .replace(/\s+/g, '')
        .trim();
}

export function createSearchKey(date: string, name: string): string {
    const year = date.slice(0, 4);
    return `${year}_${cleanTitle(name)}`;
}