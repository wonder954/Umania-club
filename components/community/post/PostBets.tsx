// UI部品（買い目）

import { Post } from "./types";
import type { FirestoreRace } from "@/lib/race/types";   // ← 修正
import { Bet } from "@/types/bet";
import BetCard from "@/components/common/BetCard";

type Props = {
    post: Post;
    race: FirestoreRace;   // ← 修正
    expandedBets: Set<string>;
    toggleBets: (postId: string) => void;
    postHit: { isHit: boolean; payout?: number };
    renderNumbers: (bet: Bet, race: FirestoreRace) => string;   // ← 修正
    vertical?: boolean;
};

export default function PostBets({
    post,
    race,
    expandedBets,
    toggleBets,
    postHit,
    renderNumbers,
    vertical = false,
}: Props) {
    if (!post.bets || post.bets.length === 0) return null;

    const totalPoints = post.bets.reduce((sum, b) => sum + b.points, 0);

    return (
        <div className={vertical ? "space-y-2" : "mb-3"}>

            <button
                onClick={() => toggleBets(post.id)}
                className={`
                    text-xs px-3 py-2 rounded-xl font-semibold w-full text-left transition
                    shadow-sm backdrop-blur-sm
                    ${postHit.isHit
                        ? "bg-red-100/70 text-red-700"
                        : "bg-blue-100/70 text-blue-800"
                    }
                `}
            >
                {race.result ? (
                    postHit.isHit ? (
                        <>🎯 的中！（払戻 {(postHit.payout ?? 0).toLocaleString()}円）</>
                    ) : (
                        <>❌ 不的中</>
                    )
                ) : (
                    <>買い目（{totalPoints}点）</>
                )}

                <span className="float-right">
                    {expandedBets.has(post.id) ? "▲" : "▼"}
                </span>
            </button>

            {expandedBets.has(post.id) && (
                <div
                    className={`
                        ${vertical ? "space-y-3" : "mt-3 space-y-2"}
                        bg-white/60 backdrop-blur-sm 
                        p-3 rounded-xl 
                        border border-white/40 
                        shadow-sm
                    `}
                >
                    {post.bets.map((bet: Bet, index: number) => (
                        <BetCard key={index} bet={bet} race={race} showHit />
                    ))}
                </div>
            )}
        </div>
    );
}