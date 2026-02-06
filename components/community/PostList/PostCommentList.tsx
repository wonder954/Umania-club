import { Comment } from "./types";

type Props = {
    comments?: Comment[];
};

export default function PostCommentList({ comments }: Props) {
    if (!comments || comments.length === 0) return null;

    return (
        <>
            {comments.map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-600">
                            {comment.userId.substring(0, 8)}...
                        </span>
                        <span className="text-xs text-gray-400">
                            {comment.createdAt?.toDate?.().toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-800">{comment.text}</p>
                </div>
            ))}
        </>
    );
}
