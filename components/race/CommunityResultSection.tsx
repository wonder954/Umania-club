"use client";

import PostList from "@/components/community/list/PostList";
import type { FirestoreRace } from "@/lib/race/types";

type Props = {
    race: FirestoreRace;
};

export default function CommunityResultSection({ race }: Props) {
    return (
        <section id="post-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <span className="text-orange-500/80 text-2xl animate-flame">🔥</span>
                みんなの予想と結果
                <span className="text-orange-500/80 text-2xl animate-flame">🔥</span>
            </h2>

            <div
                className="
                    bg-white/70 backdrop-blur-sm 
                    rounded-2xl shadow-sm 
                    border border-white/40 
                    p-6
                "
            >
                <PostList raceId={race.id} race={race} />
            </div>
        </section>
    );
}