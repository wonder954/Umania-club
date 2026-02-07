"use client";

import PostList from "@/components/community/PostList/index";
import type { Race } from "@/lib/races";

type Props = {
    race: Race;
};

/**
 * コミュニティセクションコンポーネント
 * 
 * 責務:
 * - みんなの予想（PostList）の表示
 */
export default function CommunitySection({ race }: Props) {
    return (
        <section id="post-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-500 text-2xl">💬</span>
                みんなの予想
                <span className="text-blue-500 text-2xl">💬</span>
            </h2>
            <PostList raceId={race.id} race={race} />
        </section>
    );
}
