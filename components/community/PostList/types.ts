import { Timestamp } from "firebase/firestore";

export type Post = {
    id: string;
    userId: string;
    prediction: Record<string, string>;
    bets: any[]; // Using any[] for now as in original, or improve to Bet[] if possible
    comment: string;
    createdAt: Timestamp;
};

export type Comment = {
    id: string;
    userId: string;
    text: string;
    createdAt: Timestamp;
};
