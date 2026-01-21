import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { RaceDetail } from './types';

/**
 * レース詳細をFirestoreに保存
 */
export async function saveRaceDetail(race: RaceDetail): Promise<void> {
    try {
        const raceRef = doc(db, 'races', race.id);

        await setDoc(raceRef, {
            ...race,
            updatedAt: Timestamp.now(),
        }, { merge: true });

        console.log(`Saved race: ${race.id} (${race.name})`);
    } catch (error) {
        console.error(`Error saving race ${race.id}:`, error);
        throw error;
    }
}

/**
 * Firestoreから個別レースを取得
 */
export async function getRaceFromFirestore(id: string): Promise<RaceDetail | null> {
    try {
        const raceRef = doc(db, 'races', id);
        const snap = await getDoc(raceRef);

        if (!snap.exists()) {
            return null;
        }

        const data = snap.data();
        return {
            id: snap.id,
            ...data,
            updatedAt: data.updatedAt?.toDate(),
        } as RaceDetail;
    } catch (error) {
        console.error(`Error fetching race ${id}:`, error);
        throw error;
    }
}

/**
 * Firestoreから全レースを取得
 */
export async function getAllRacesFromFirestore(): Promise<RaceDetail[]> {
    try {
        const racesRef = collection(db, 'races');
        const q = query(racesRef, orderBy('date', 'desc'));
        const snap = await getDocs(q);

        return snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                updatedAt: data.updatedAt?.toDate(),
            } as RaceDetail;
        });
    } catch (error) {
        console.error('Error fetching all races:', error);
        throw error;
    }
}

/**
 * 複数レースを一括保存
 */
export async function saveMultipleRaces(races: RaceDetail[]): Promise<void> {
    try {
        const promises = races.map(race => saveRaceDetail(race));
        await Promise.all(promises);
        console.log(`Saved ${races.length} races to Firestore`);
    } catch (error) {
        console.error('Error saving multiple races:', error);
        throw error;
    }
}
