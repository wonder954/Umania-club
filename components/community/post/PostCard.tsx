// PC/Mobile の切り替え（レイアウト）

import { User } from "firebase/auth";
import { Bet } from "@/types/bet";
import { Post, Comment } from "./types";
import PostCardPC from "./PostCardPC";
import PostCardMobile from "./PostCardMobile";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";


type Props = {
    post: Post;
    race: RaceViewModel;
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
    renderNumbers: (bet: Bet, race: RaceViewModel) => string;   // ← 修正
    groupName?: string | null;
};

export default function PostCard(props: Props) {
    return (
        <>
            <div className="hidden md:block">
                <PostCardPC {...props} />
            </div>

            <div className="md:hidden">
                <PostCardMobile {...props} />
            </div>
        </>
    );
}