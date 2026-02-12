import { Timestamp } from "firebase/firestore";

export type Post = {
    id: string;
    userId: string;
    authorName: string;
    authorIcon: string;
    prediction: Record<string, string>;
    bets: any[];
    comment: string;
    createdAt: Timestamp;
};

export type Comment = {
    id: string;
    userId: string;
    authorName: string;
    authorIcon: string;
    text: string;
    createdAt: Timestamp;
};
