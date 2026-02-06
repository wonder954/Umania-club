//UI部品（買い目）

import { Post } from "./types";
import { Race } from "@/lib/races";
import { Bet } from "@/types/bet";
import BetCard from "@/components/common/BetCard";

type Props = {
    post: Post;
    race?: Race;
    expandedBets: Set<string>;
    toggleBets: (postId: string) => void;
    postHit: { isHit: boolean; payout?: number };
    renderNumbers: (bet: Bet, race?: Race) => string;
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

    return (
        <div className={vertical ? "space-y-2" : "mb-3"}>
            {/* トグルボタン */}
            <button
                onClick={() => toggleBets(post.id)}
                className={`text-xs px-3 py-2 rounded-lg font-semibold w-full text-left transition
                    ${postHit.isHit
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-800"
                    }`}
            >
                {race?.result ? (
                    postHit.isHit ? (
                        <>🎯 的中！（払戻 {(postHit.payout ?? 0).toLocaleString()}円）</>
                    ) : (
                        <>❌ 不的中</>
                    )
                ) : (
                    <>買い目 {post.bets.length}点</>
                )}
                <span className="float-right">
                    {expandedBets.has(post.id) ? "▲" : "▼"}
                </span>
            </button>

            {/* 展開部分 */}
            {expandedBets.has(post.id) && (
                <div
                    className={
                        vertical
                            ? "space-y-3 bg-blue-50 p-3 rounded-lg"
                            : "mt-3 space-y-2 bg-blue-50 p-3 rounded-lg"
                    }
                >
                    {post.bets.map((bet: Bet, index: number) => (
                        <BetCard key={index} bet={bet} race={race} showHit />
                    ))}
                </div>
            )}
        </div>
    );
}