import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    
    try {

        const ref = doc(db, "races", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            return NextResponse.json(
                { error: "Race not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id,
            ...snap.data(),
        });
    } catch (error) {
        console.error(`Error in GET /api/races/${id}:`, error);

        return NextResponse.json(
            {
                error: "Failed to fetch race",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export const revalidate = 0;
