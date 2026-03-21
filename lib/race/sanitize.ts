export function sanitizeFirestoreRace(race: any) {
    return {
        ...race,
        entries: race.entries?.map((e: any) => ({
            frame: e.frame ?? null,
            number: e.number ?? null,
            name: e.name ?? "",
            sex: e.sex ?? null,
            age: e.age ?? null,
            jockey: e.jockey ?? null,
            weight: e.weight ?? null,
            odds: e.odds ?? null,
            popular: e.popular ?? null,
        })) ?? [],
        result: race.result ?? null,
    };
}