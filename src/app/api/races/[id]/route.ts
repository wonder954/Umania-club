import { NextRequest, NextResponse } from 'next/server';
import { loadRaceJson } from '../utils';

/**
 * 個別レース詳細取得API
 * GET /api/races/[id]
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const race = loadRaceJson(id);

        if (!race) {
            return NextResponse.json(
                { error: 'Race not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(race);
    } catch (error) {
        console.error(`Error in GET /api/races:`, error);

        return NextResponse.json(
            {
                error: 'Failed to fetch race',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// キャッシュ無効化
export const revalidate = 0;
