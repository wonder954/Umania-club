import Link from "next/link";
import { normalizeGrade } from "@/utils/race/raceGradeUtils";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";
import { formatRelativeTime } from "@/utils/formatTime";
import type { Post } from "@/types/post";
import { formatRaceName } from "@/utils/race";

type Props = {
    posts: Post[];
};

function extractGradeFromRaceName(name: string): string {
    const match = name.match(/J?G[1-3]/i);
    return match ? match[0].toUpperCase() : "OP";
}

function getHonmei(post: Post): string | null {
    if (!post.prediction) return null;

    // prediction: { "馬名": "◎", ... }
    for (const [horse, mark] of Object.entries(post.prediction)) {
        if (mark === "◎") return horse;
    }

    return null;
}

export default function GroupPostList({ posts }: Props) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">グループの投稿</h2>

            {posts.length === 0 && (
                <p className="text-slate-500">まだ投稿がありません。</p>
            )}

            <div className="space-y-4">
                {posts.map((post) => {
                    const grade = normalizeGrade(post.grade ?? "OP");
                    const style = getGradeStyleUI(grade);

                    // 🔥 createdAt を Date に変換
                    const createdAt =
                        post.createdAt?.toDate
                            ? post.createdAt.toDate()
                            : new Date(post.createdAt);

                    const honmei = getHonmei(post);

                    return (
                        <Link key={post.id} href={`/races/${post.raceId}/posts/${post.id}`}>
                            <div
                                className="
                    p-4 rounded-xl
                    bg-white/90 backdrop-blur-sm
                    border border-white/60
                    shadow-sm
                    cursor-pointer
                    hover:bg-slate-50/80 hover:shadow-md
                    transition
                "
                            >
                                {/* 🔥 タイムスタンプ（アイコン付き） */}
                                <div className="flex items-center text-xs text-slate-500 mb-1 gap-1">
                                    <span className="text-slate-400">🕒</span>
                                    <span>{formatRelativeTime(createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={post.authorIcon || "/profile-icons/default1.png"}
                                        className="
                            w-8 h-8 rounded-full
                            border border-white/70
                            shadow-sm
                        "
                                        alt="icon"
                                    />
                                    <span className="text-sm text-slate-700">
                                        {post.authorName || "名無し"}
                                    </span>
                                </div>

                                <span
                                    className={`
        inline-block text-sm font-semibold
        px-3 py-1 rounded-lg
        ${style.bg} ${style.text}
    `}
                                >
                                    {post.raceTitleLabel ?? formatRaceName(post.raceName)}
                                </span>

                                {/* ◎ 本命馬 */}
                                {honmei && (
                                    <p className="text-sm text-slate-700 mt-1 ml-9">
                                        ◎ {honmei}…
                                    </p>
                                )}

                                {post.comment && (
                                    <p className="text-sm text-slate-700 mt-1 ml-9 line-clamp-2">
                                        {post.comment}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}