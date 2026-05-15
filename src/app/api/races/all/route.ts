import { NextResponse } from "next/server";
import { getAllFirestoreRaces } from "@/src/lib/race/firestore";

export async function GET() {
    const races = await getAllFirestoreRaces();
    return NextResponse.json(races);
}
