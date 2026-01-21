import { NextResponse } from 'next/server';
import { getAllRacesFromFirestore } from '@/lib/raceRepository';

/**
 * レース一覧取得API
 * GET /api/races
 */
export async function GET() {
    try {
        const races = await getAllRacesFromFirestore();

        return NextResponse.json(races);
    } catch (error) {
        console.error('Error in GET /api/races:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch races',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// キャッシュ無効化（常に最新データを返す）
export const revalidate = 0;
