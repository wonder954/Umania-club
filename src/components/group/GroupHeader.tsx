type Props = {
    name: string;
    memberCount: number;
};

export default function GroupHeader({ name, memberCount }: Props) {
    return (
        <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-wide">
                {name}
            </h1>

            <p className="text-sm text-slate-600">
                メンバー数: {memberCount}
            </p>
        </div>
    );
}