// app/races/[raceId]/page.tsx

import RacePageClient from "./RacePageClient";

export default async function RacePage({
    params,
}: {
    params: Promise<{ raceId: string }>;
}) {
    const { raceId } = await params;
    return <RacePageClient raceId={raceId} />;
}
