// PC/Mobile の切り替え（レイアウト）

import { User } from "firebase/auth";
import { Bet } from "@/types/bet";
import { Race } from "@/lib/races";
import { Post, Comment } from "./types";
import PostCardPC from "./PostCardPC";
import PostCardMobile from "./PostCardMobile";

type Props = {
    post: Post;
    race?: Race;
    user: User | null;
    expandedBets: Set<string>;
    toggleBets: (postId: string) => void;
    showComments: Set<string>;
    toggleComments: (postId: string) => void;
    comments: Comment[];
    commentText: string;
    setCommentText: (text: string) => void;
    handleAddComment: (text: string) => void;
    handleDeleteComment: (commentId: string) => void;
    postHit: { isHit: boolean; payout?: number };
    renderNumbers: (bet: Bet, race?: Race) => string;

    // 🔥 追加：グループ名
    groupName?: string | null;
};

export default function PostCard(props: Props) {
    return (
        <>
            {/* PCレイアウト */}
            <div className="hidden md:block">
                <PostCardPC {...props} />
            </div>

            {/* スマホレイアウト */}
            <div className="md:hidden">
                <PostCardMobile {...props} />
            </div>
        </>
    );
}