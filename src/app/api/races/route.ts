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

// キャッシュ無効化（常に最新データを返す）
export const revalidate = 0;
