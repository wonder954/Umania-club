// // lib/races.ts

// import { collection, getDocs, doc, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import type { RaceInfo, Entry, RaceResult } from "@/types/race";

// // -----------------------------
// // 型定義（Firestore の構造に合わせる）
// // -----------------------------
// export type Race = {
//     raceId: string;
//     info: RaceInfo;
//     entries: Entry[];
//     result: RaceResult | null;
//     createdAt?: any;
//     updatedAt?: any;
// };

// // -----------------------------
// // Firestore から 1 レース取得
// // -----------------------------
// export async function getRace(raceId: string): Promise<Race | null> {
//     const ref = doc(db, "races", raceId);
//     const snap = await getDoc(ref);

//     if (!snap.exists()) return null;

//     const data = snap.data();

//     return {
//         raceId,
//         info: data.info,
//         entries: data.entries ?? [],
//         result: data.result ?? null,
//         createdAt: data.createdAt,
//         updatedAt: data.updatedAt,
//     };
// }

// // -----------------------------
// // Firestore から全レース取得
// // -----------------------------
// export async function getAllRaces(): Promise<Race[]> {
//     const snap = await getDocs(collection(db, "races"));

//     return snap.docs.map((docSnap) => {
//         const data = docSnap.data();

//         return {
//             raceId: docSnap.id,
//             info: data.info,
//             entries: data.entries ?? [],
//             result: data.result ?? null,
//             createdAt: data.createdAt,
//             updatedAt: data.updatedAt,
//         };
//     });
// }