import ResultPageClient from "./ResultPageClient";

// ✅ result/page.tsx も同様に修正
export default async function ResultPage({
    params,
}: {
    params: Promise<{ raceId: string }>;
}) {
    const { raceId } = await params;
    return <ResultPageClient raceId={raceId} />;
}