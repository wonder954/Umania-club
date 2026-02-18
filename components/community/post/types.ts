import { Timestamp } from "firebase/firestore";
import { Bet } from "@/types/bet";

export type Post = {
    id: string;

    // 投稿者情報
    authorId: string;
    authorName: string;
    authorIcon: string;

    // 公開範囲（public / group / private）
    visibility: string;

    // 🔥 追加：グループ名（usePosts が付与）
    groupName?: string | null;

    // 予想内容（単勝・馬連などのテキスト）
    prediction: Record<string, string>;

    // 🔥 bets は絶対に配列（undefined を許さない）
    bets: Bet[];

    // 投稿本文
    comment: string;

    // レース情報
    raceId: string;
    raceName: string;

    // 作成日時
    createdAt: Timestamp;

    // いいねしたユーザーID一覧
    likes: string[];
};


export type Comment = {
    id: string;

    authorId: string;
    authorName: string;
    authorIcon: string;

    text: string;
    createdAt: Timestamp;

    // いいねしたユーザーID一覧
    likes: string[];

    // 返信コメントの場合
    parentId: string | null;
};
