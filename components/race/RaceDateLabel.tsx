import { formatDateWithWeekday, formatShortDate } from "@/lib/date";

export function RaceDateLabel({ date }: { date: string }) {
    return (
        <>
            {/* スマホ */}
            <span className="text-slate-600 text-sm md:hidden">
                {formatShortDate(date)}
            </span>

            {/* PC */}
            <span className="text-slate-600 text-sm hidden md:inline">
                {formatDateWithWeekday(date)}
            </span>
        </>
    );
}