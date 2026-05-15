import { NextResponse } from "next/server";
import { db } from "@/src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

/**
 * レース一覧取得API
 * GET /api/races
 */
export async function GET() {
    const snap = await getDocs(collection(db, "races"));
    const races = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(races);
}

// キャッシュ有効化
export const revalidate = 60;
