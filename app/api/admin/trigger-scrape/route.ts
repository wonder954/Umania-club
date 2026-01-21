import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * スクレイピング実行API
 * POST /api/admin/trigger-scrape
 * 
 * 外部プロセスとしてスクレイパーを実行
 */
export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const authHeader = request.headers.get('authorization');
        const adminToken = process.env.ADMIN_TOKEN;

        if (adminToken && authHeader !== `Bearer ${adminToken}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Triggering scraper...');

        // スクレイパーを外部プロセスとして実行
        const scraperPath = path.join(process.cwd(), 'scripts', 'scraper');
        const { stdout, stderr } = await execAsync('node scrape.js', {
            cwd: scraperPath,
            timeout: 120000, // 2分タイムアウト
        });

        // JSON出力をパース
        let result;
        try {
            result = JSON.parse(stdout);
        } catch (e) {
            // パース失敗時は生の出力を返す
            result = { output: stdout };
        }

        if (stderr) {
            console.warn('Scraper stderr:', stderr);
        }

        return NextResponse.json({
            success: true,
            ...result,
        });

    } catch (error) {
        console.error('Error executing scraper:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

// GETリクエストの場合
export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Use POST method to trigger scraping',
        usage: 'curl -X POST http://localhost:3000/api/admin/trigger-scrape',
    }, { status: 405 });
}
