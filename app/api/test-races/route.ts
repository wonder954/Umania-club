import { NextResponse } from "next/server";
import { getAllRaces } from "@/lib/races";

export async function GET() {
    const races = await getAllRaces();
    return NextResponse.json(races);
}