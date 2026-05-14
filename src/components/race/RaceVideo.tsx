// components/race/RaceVideo.tsx

type Props = {
    videoId: string | null;
};

export function RaceVideo({ videoId }: Props) {
    if (!videoId) return null;

    return (
        <section className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <span className="text-blue-600/80 text-2xl animate-pulse">
                    🎬
                </span>
                レース動画
                <span className="text-blue-600/80 text-2xl animate-pulse">
                    🎬
                </span>
            </h2>

            <div className="rounded-xl overflow-hidden shadow-sm border border-white/40 bg-white/60 backdrop-blur-sm">
                <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="JRA Official Race Video"
                    allowFullScreen
                    className="w-full h-[220px] sm:h-[315px]"
                />
            </div>
        </section>
    );
}