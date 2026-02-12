"use client";

import PostList from "@/components/community/PostList/index";
import type { Race } from "@/lib/races";

type Props = {
    race: Race;
};

export default function CommunitySection({ race }: Props) {
    return (
        <section id="post-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                {/* 元の青を薄く残す */}
                <span className="text-blue-500/80 text-2xl">💬</span>
                みんなの予想
                <span className="text-blue-500/80 text-2xl">💬</span>
            </h2>

            {/* PostList を透明白カードで包む */}
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