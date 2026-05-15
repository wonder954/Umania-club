export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAllFirestoreRaces } from "@/src/lib/race/firestore";

export async function GET() {
    const races = await getAllFirestoreRaces();
    return NextResponse.json(races);
}
// キャッシュ有効化
export const revalidate = 60;