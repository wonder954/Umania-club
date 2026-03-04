import Link from "next/link";
import { normalizeGrade, getGradeStyle } from "@/utils/race/raceGradeUtils";
import type { Post } from "@/types/post";

type Props = {
    posts: Post[];
};

function extractGradeFromRaceName(name: string): string {
    const match = name.match(/G[1-3]/);
    return match ? match[0] : "OP";
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
                    const grade = normalizeGrade(extractGradeFromRaceName(post.raceName));
                    const colorClass = getGradeStyle(grade);

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
                                        ${colorClass}
                                    `}
                                >
                                    {post.raceName}
                                </span>

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