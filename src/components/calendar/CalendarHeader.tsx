type CalendarHeaderProps = {
    year: number;
    month: number;
    changeMonth: (diff: number) => void;
};

export function CalendarHeader({ year, month, changeMonth }: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="text-xl px-2">‹</button>

            <div className="text-lg font-bold">
                {year}年 {month + 1}月
            </div>

            <button onClick={() => changeMonth(1)} className="text-xl px-2">›</button>
        </div>
    );
}