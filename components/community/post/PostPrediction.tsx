import { Post } from "./types";
import { Race } from "@/lib/races";

type Props = {
    post: Post;
    race: Race;          // ← 必須に変更
    vertical?: boolean;
};

export default function PostPrediction({ post, race, vertical = false }: Props) {
    if (!post.prediction || Object.keys(post.prediction).length === 0) return null;

    const items = Object.entries(post.prediction)
        .map(([key, mark]) => {
            const horse =
                race.horses?.find((h: any) => String(h.number) === key) ||
                race.horses?.find((h: any) => h.name === key);

            return {
                mark,
                number: horse?.number ?? null,
                name: horse?.name ?? key,
            };
        })
        .sort((a, b) => {
            const order: Record<string, number> = {
                "◎": 1,
                "〇": 2,
                "▲": 3,
                "△": 4,
            };
            const diff = (order[a.mark] || 99) - (order[b.mark] || 99);
            if (diff !== 0) return diff;
            return (Number(a.number ?? 999)) - (Number(b.number ?? 999));
        });

    return (
        <div className={vertical ? "space-y-2" : "flex gap-2 mb-3 overflow-x-auto"}>
            {items.map((item) => (
                <div
                    key={`${item.name}-${item.mark}`}
                    className={
                        vertical
                            ? "flex items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg shadow-sm"
                            : "inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm whitespace-nowrap"
                    }
                >
                    <span className="font-bold mr-1.5 text-lg">{item.mark}</span>

                    {item.number && (
                        <span className="text-gray-700 font-mono mr-2">
                            {item.number}番
                        </span>
                    )}

                    <span className="text-gray-900 font-bold">{item.name}</span>
                </div>
            ))}
        </div>
    );
}