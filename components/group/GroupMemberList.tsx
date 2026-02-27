import { useRouter } from "next/navigation";

type Member = {
    uid: string;
    name: string;
    icon: string;
};

type Props = {
    members: Member[];
    currentUserId: string;
    ownerId: string;
};

export default function GroupMemberList({ members, currentUserId, ownerId }: Props) {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
                メンバー（{members.length}人）
            </h2>

            <ul className="space-y-3">
                {members.map((m) => {
                    const isYou = m.uid === currentUserId;
                    const isOwner = m.uid === ownerId;

                    return (
                        <li
                            key={m.uid}
                            className="
                                flex items-center gap-3 cursor-pointer
                                px-2 py-2 rounded-xl
                                hover:bg-slate-50/70
                                transition
                            "
                            onClick={() => router.push(`/users/${m.uid}`)}
                        >
                            <img
                                src={m.icon}
                                className="
                                    w-10 h-10 rounded-full
                                    border border-white/70
                                    shadow-sm
                                "
                                alt="icon"
                            />

                            <div className="flex flex-col">
                                <span className="font-medium text-slate-800">
                                    {isYou ? "あなた" : m.name}
                                </span>

                                {isOwner && (
                                    <span className="text-xs text-blue-500 font-semibold">
                                        オーナー
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}