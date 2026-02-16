import { Timestamp } from "firebase/firestore";

export type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorIcon: string;
    visibility: string;
    prediction: Record<string, string>;
    bets: any[];
    comment: string;
    raceId: string;
    raceName: string;
    createdAt: Timestamp;
    likes: string[];
};

export type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorIcon: string;
    text: string;
    createdAt: Timestamp;
    likes?: string[];
};
