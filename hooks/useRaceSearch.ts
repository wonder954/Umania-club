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
                if (!/^\d{10}$/.test(race.id)) return false;

                const d = new Date(race.date);
                const y = d.getFullYear().toString();
                const m = (d.getMonth() + 1).toString();

                console.log("race.id:", race.id, "date:", race.date, "year:", y, "searchKey:", race.searchKey);

                if (y !== selectedYear) return false;
                if (selectedMonth && m !== selectedMonth) return false;

                // 🔥 searchKey を使ったキーワード検索
                function normalizeText(str: string) {
                    return str
                        .normalize("NFKC")
                        .replace(/[\u0300-\u036f]/g, "") // 結合文字を除去
                        .toLowerCase();
                }

                if (keyword.trim() !== "") {
                    const key = normalizeText(keyword);
                    const searchKey = normalizeText(race.searchKey ?? "");

                    if (!searchKey.includes(key)) return false;
                }

                return true;
            })
            .sort((a, b) => a.date.localeCompare(b.date));
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