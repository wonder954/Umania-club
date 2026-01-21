import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

/**
 * Firebase Admin SDKを初期化
 */
export function initializeFirebase() {
    if (db) return db;

    try {
        // サービスアカウントキーを読み込み
        const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        db = admin.firestore();
        console.log('Firebase Admin SDK initialized');
        return db;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error);
        console.error('Make sure serviceAccountKey.json exists in scripts/scraper/');
        throw error;
    }
}

/**
 * レース一覧を保存
 */
export async function saveRace(race) {
    const firestore = initializeFirebase();

    try {
        await firestore.collection('races').doc(race.id).set({
            ...race,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log(`Saved race: ${race.id} (${race.name})`);
    } catch (error) {
        console.error(`Error saving race ${race.id}:`, error);
        throw error;
    }
}

/**
 * 複数レースを一括保存
 */
export async function saveMultipleRaces(races) {
    const firestore = initializeFirebase();
    const batch = firestore.batch();

    races.forEach((race) => {
        const ref = firestore.collection('races').doc(race.id);
        batch.set(ref, {
            ...race,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    });

    try {
        await batch.commit();
        console.log(`Saved ${races.length} races to Firestore`);
    } catch (error) {
        console.error('Error in batch save:', error);
        throw error;
    }
}
