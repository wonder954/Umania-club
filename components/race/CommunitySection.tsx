"use client";

import PostList from "@/components/community/list/PostList";
import type { Race } from "@/lib/races";
import Image from "next/image";

type Props = {
    race: Race;
};

export default function CommunitySection({ race }: Props) {
    return (
        <section id="post-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Image
                    src="/flag.png"
                    alt="prediction"
                    width={28}
                    height={28}
                    className="h-7 w-auto object-contain drop-shadow-sm"
                />
                みんなの予想
                <Image
                    src="/flag.png"
                    alt="prediction"
                    width={28}
                    height={28}
                    className="h-7 w-auto object-contain drop-shadow-sm"
                />
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