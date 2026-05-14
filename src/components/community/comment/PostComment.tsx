

import { Post } from "../post/types";

type Props = {
    post: Post;
};

export default function PostComment({ post }: Props) {
    if (!post.comment) return null;

    return (
        <div className="mt-3 mb-2">
            <p className="text-gray-800 bg-amber-50 border-l-4 border-amber-400 p-3 rounded text-sm italic">
                "{post.comment}"
            </p>
        </div>
    );
}
