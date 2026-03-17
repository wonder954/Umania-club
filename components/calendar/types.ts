export type GradeStyle = {
    label: string;
    bg: string;
    text: string;
    border: string;
};

export type CalendarRace = {
    id: string;
    title: string;
    raceName?: string;
    grade: string | null;
    date: string;
    color: GradeStyle;
    isWeak?: boolean;
};