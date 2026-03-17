export function sanitizeFirestoreRace(race: any) {
    return {
        ...race,
        entries: race.entries?.map((e: any) => ({
            name: e.name ?? "",
            sex: e.sex ?? null,
            age: e.age ?? null,
            jockey: e.jockey ?? null,
            weight: e.weight ?? null,
        })) ?? [],
        result: race.result ?? null,
    };
}