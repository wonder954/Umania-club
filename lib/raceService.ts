import { RaceDetail } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * 今週の重賞レース一覧を取得
 */
export async function getWeeklyRaces(): Promise<RaceDetail[]> {
    try {
        const response = await fetch(`${BASE_URL}/api/races`, {
            cache: 'no-store', // 常に最新データを取得
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch races: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getWeeklyRaces:', error);
        throw error;
    }
}

/**
 * 個別レース詳細を取得
 */
export async function getRaceDetail(id: string): Promise<RaceDetail | null> {
    try {
        const response = await fetch(`${BASE_URL}/api/races/${id}`, {
            cache: 'no-store',
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch race ${id}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error in getRaceDetail(${id}):`, error);
        throw error;
    }
}
