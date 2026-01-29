import { getAllRaces } from "@/lib/races";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const races = await getAllRaces();
    const cwd = process.cwd();
    const dataDir = "scripts/scraper/data";
    const absoluteDataDir = path.join(cwd, dataDir);

    let dirExists = false;
    let folders: string[] = [];
    let latestFolder = "";
    let latestFolderFiles: string[] = [];

    try {
        if (fs.existsSync(absoluteDataDir)) {
            dirExists = true;
            folders = fs.readdirSync(absoluteDataDir);

            // Find latest folder
            const scraperFolders = folders
                .filter(f => /^\d{8}[wf]$/.test(f))
                .sort((a, b) => b.localeCompare(a));

            if (scraperFolders.length > 0) {
                latestFolder = scraperFolders[0];
                const latestPath = path.join(absoluteDataDir, latestFolder, "races");
                if (fs.existsSync(latestPath)) {
                    latestFolderFiles = fs.readdirSync(latestPath);
                }
            }
        }
    } catch (e) {
        console.error(e);
    }

    const debugInfo = {
        timestamp: new Date().toISOString(),
        env: {
            DATA_SOURCE: process.env.DATA_SOURCE,
            NODE_ENV: process.env.NODE_ENV,
        },
        fs: {
            cwd,
            dataDir,
            absoluteDataDir,
            dirExists,
            folders,
            latestFolder,
            latestFolderFiles: latestFolderFiles.length
        },
        races: {
            count: races.length,
            items: races.map(r => ({
                id: r.id,
                name: r.name,
                date: r.date,
                hasResult: !!r.result
            }))
        }
    };

    return (
        <div className="p-8 font-mono text-sm bg-gray-900 text-green-400 min-h-screen">
            <h1 className="text-xl font-bold mb-4">Debug Info</h1>
            <pre className="whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
            </pre>
        </div>
    );
}
