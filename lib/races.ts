// lib/races.ts

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// -----------------------------
// 型定義
// -----------------------------
export type Race = {
    id: string;
    name: string;
    date: string;
    raceName?: string;     // GII を除いた純粋なレース名

    place: string | null;
    raceNumber: string | null;
    grade: string | null;
    placeDetail?: string | null;

    course: {
        surface: string | null;
        distance: number | null;
        direction: string | null;
        courseDetail?: string | null;
    };

    weightType?: string | null;

    horses: {
        frame: number | null;
        number: number | null;
        name: string;
        jockey?: string | null;
        weight?: string | number | null;
        odds?: number | null;
        popular?: number | null;
    }[];

    result: {
        order: {
            rank: number;
            frame: number;
            number: number;
            name: string;
            time?: string | null;
            margin?: string | null;
            jockey?: string | null;
            weight?: string | number | null;
            popular?: number | null;
            odds?: number | null;
        }[];

        payout: {
            win?: { numbers: number[]; amount: number; popular: number }[];
            place?: { numbers: number[]; amount: number; popular: number }[];
            quinella?: { numbers: number[]; amount: number; popular: number }[];
            wide?: { numbers: number[]; amount: number; popular: number }[];
            exacta?: { numbers: number[]; amount: number; popular: number }[];
            trio?: { numbers: number[]; amount: number; popular: number }[];
            trifecta?: { numbers: number[]; amount: number; popular: number }[];
            bracket?: { numbers: number[]; amount: number; popular: number }[];
        };
    } | null;

    createdAt?: any;
    updatedAt?: any;

    // 🔥 Firestore の searchKey をそのまま使う
    searchKey?: string | null;
};

// -----------------------------
// Firestore から 1 レース取得
// -----------------------------
export async function getRace(raceId: string): Promise<Race | null> {
    const ref = doc(db, "races", raceId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data();

    return {
        id: raceId,
        name: data.name,
        date: data.date,
        place: data.place ?? null,
        raceNumber: data.raceNumber ?? null,
        grade: data.grade ?? null,
        placeDetail: data.placeDetail ?? null,
        weightType: data.weightType ?? null,
        course: data.course ?? {
            surface: null,
            distance: null,
            direction: null,
            courseDetail: null,
        },
        horses: data.horses ?? [],
        result: data.result ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,

        // 🔥 これが重要
        searchKey: data.searchKey ?? null,
    };
}

// -----------------------------
// Firestore から全レース取得
// -----------------------------
export async function getAllRaces(): Promise<Race[]> {
    const snap = await getDocs(collection(db, "races"));

    return snap.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
            id: docSnap.id,
            name: data.name,
            date: data.date,
            place: data.place ?? null,
            raceNumber: data.raceNumber ?? null,
            grade: data.grade ?? null,
            placeDetail: data.placeDetail ?? null,
            weightType: data.weightType ?? null,
            course: data.course ?? {
                surface: null,
                distance: null,
                direction: null,
                courseDetail: null,
            },
            horses: data.horses ?? [],
            result: data.result ?? null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,

            // 🔥 これがないと検索できない
            searchKey: data.searchKey ?? null,
        };
    });
}