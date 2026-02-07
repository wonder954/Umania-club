"use client";

import PostList from "@/components/community/PostList/index";
import type { Race } from "@/lib/races";

type Props = {
    race: Race;
};

/**
 * コミュニティ結果セクションコンポーネント
 * 
 * 責務:
 * - レース終了後のみんなの予想と結果の表示
 */
export default function CommunityResultSection({ race }: Props) {
    return (
        <section id="post-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-500 text-2xl animate-flame">🔥</span>
                みんなの予想と結果
                <span className="text-orange-500 text-2xl animate-flame">🔥</span>
            </h2>

            <div className="bg-white p-6 rounded-xl shadow">
                <PostList raceId={race.id} race={race} />
            </div>
        </section>
    );
}
