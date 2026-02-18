export interface Post {
    id: string;                 // Firestore のドキュメントID
    authorId: string;           // 投稿者UID
    authorName: string;         // 投稿者名（必須）
    authorIcon: string;         // 投稿者アイコンURL（必須）

    raceId: string;             // レースID
    raceName: string;           // レース名

    visibility: string;         // "public" or "group:{id}"

    prediction: Record<string, string>; // { "馬名": "◎" } など
    bets: any[];                // 買い目（型を後で細かくしてもOK）

    comment?: string;           // コメント（任意）

    createdAt: any;             // Firestore Timestamp
}