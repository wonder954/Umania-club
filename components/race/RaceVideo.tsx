// components/race/RaceVideo.tsx

type Props = {
    videoId: string;
};

export function RaceVideo({ videoId }: Props) {
    return (
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black/20 backdrop-blur-sm">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="JRA Race Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            />
        </div>
    );
}