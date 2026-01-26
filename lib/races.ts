import racesData from "@/data/races.json";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// -----------------------------
// 型定義
// -----------------------------
export type Race = {
    id: string;
    name: string;
    date: string;
    place?: string;        // ← 追加
    raceNumber?: string;   // ← 追加


    course: {
        surface: string;       // 芝 or ダート
        distance: number;      // 2200
        direction: string;     // 右 or 左
        courseDetail?: string | null; // 外 or 内
    };

    grade?: string;
    weightType?: string;

    horses: Array<{
        number?: number | string;
        name: string;
        jockey?: string;
        weight?: number | string;
    }>;

    result: any;
};

// -----------------------------
// JSON 版
// -----------------------------
export async function getRaceFromJson(raceId: string) {
    return (racesData as Record<string, Race>)[raceId] || null;
}

export async function getAllRacesFromJson() {
    return Object.values(racesData as Record<string, Race>);
}

// -----------------------------
// Firestore 版
// -----------------------------
export async function getRaceFromFirestore(raceId: string) {
    const ref = doc(db, "races", raceId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getAllRacesFromFirestore() {
    const snapshot = await getDocs(collection(db, "races"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// -----------------------------
// 切り替えスイッチ
// -----------------------------
const useFirestore = process.env.DATA_SOURCE === "firebase";

// -----------------------------
// 公開 API（ここだけ使えばOK）
// -----------------------------
export async function getRace(id: string) {
    return useFirestore
        ? getRaceFromFirestore(id)
        : getRaceFromJson(id);
}

export async function getAllRaces() {
    return useFirestore
        ? getAllRacesFromFirestore()
        : getAllRacesFromJson();
}