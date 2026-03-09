import { adminDb } from '../scraper/firebase-admin';
import { createSearchKey, cleanTitle } from '../utils/raceUtils';
import { normalizeDistance } from '../utils/normalize';
import type { RaceInfo, Entry, RaceResult } from '../../types/race';

interface SaveToFirestoreParams {
    raceId: string;
    info: RaceInfo;
    entries: Entry[];
    result?: RaceResult | null;
}

/**
 * レースデータを Firestore に保存（今週・先週共通）
 */
export async function saveRaceToFirestore({
    raceId,
    info,
    entries,
    result = null,
}: SaveToFirestoreParams): Promise<void> {
    const data = {
        id: raceId,
        name: cleanTitle(info.title),
        date: info.date ?? null,
        year: Number(info.date?.slice(0, 4)),
        searchKey: createSearchKey(info.date, info.title),
        place: info.place ?? null,
        raceNumber: info.raceNumber ?? null,
        grade: info.grade ?? null,
        placeDetail: info.placeDetail ?? null,
        course: {
            surface: info.surface ?? null,
            distance: normalizeDistance(info.distance),
            direction: info.direction ?? null,
            courseDetail: info.courseDetail ?? null,
        },
        weightType: info.weightType ?? null,
        horses: entries.map(e => ({
            frame: e.frame ?? null,
            number: e.number ?? null,
            name: e.name ?? null,
            jockey: e.jockey ?? null,
            weight: e.weight ?? null,
            odds: e.odds ?? null,
            popular: e.popular ?? null,
        })),
        result,
    };

    await adminDb
        .collection('races')
        .doc(raceId)
        .set(data, { merge: true });
}