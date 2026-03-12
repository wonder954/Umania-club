import { useState, useMemo } from "react";
import type { Race } from "@/lib/races";

type UseRaceSearchReturn = {
    selectedYear: string;
    selectedMonth: string;
    keyword: string;
    setSelectedYear: (year: string) => void;
    setSelectedMonth: (month: string) => void;
    setKeyword: (keyword: string) => void;
    filteredRaces: Race[];
    years: { label: string; value: string }[];
    months: { label: string; value: string }[];
};

export function useRaceSearch(allRaces: Race[]): UseRaceSearchReturn {
    const years = useMemo(() => {
        const y = new Date().getFullYear();
        return [
            { label: `${y - 1}年`, value: (y - 1).toString() },
            { label: `${y}年`, value: y.toString() },
            { label: `${y + 1}年`, value: (y + 1).toString() },
        ];
    }, []);

    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [keyword, setKeyword] = useState<string>("");

    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            return { label: `${m}月`, value: m.toString() };
        });
    }, []);

    const filteredRaces = useMemo(() => {
        return allRaces
            .filter((race) => {
                // raceId は 10 桁
                if (!/^\d{10}$/.test(race.raceId)) return false;

                const d = new Date(race.info.date);
                const y = d.getFullYear().toString();
                const m = (d.getMonth() + 1).toString();

                if (y !== selectedYear) return false;
                if (selectedMonth && m !== selectedMonth) return false;

                // 🔥 キーワード検索（title + place + grade + date）
                if (keyword.trim() !== "") {
                    const keys = keyword
                        .split(/\s+/) // スペースで分割
                        .map((k) => k.toLowerCase());

                    const text =
                        `${race.info.title} ${race.info.place} ${race.info.grade ?? ""} ${race.info.date}`
                            .toLowerCase();

                    // 全キーワード AND 検索
                    for (const k of keys) {
                        if (!text.includes(k)) return false;
                    }
                }

                return true;
            })
            .sort((a, b) => a.info.date.localeCompare(b.info.date));
    }, [allRaces, selectedYear, selectedMonth, keyword]);

    return {
        selectedYear,
        selectedMonth,
        keyword,
        setSelectedYear,
        setSelectedMonth,
        setKeyword,
        filteredRaces,
        years,
        months,
    };
}