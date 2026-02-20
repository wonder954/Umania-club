import { useState, useMemo } from "react";
import type { Race } from "@/lib/races";

type UseRaceSearchReturn = {
    selectedYear: string;
    selectedMonth: string;
    setSelectedYear: (year: string) => void;
    setSelectedMonth: (month: string) => void;
    filteredRaces: Race[];
    years: { label: string; value: string }[];
    months: { label: string; value: string }[];
};

export function useRaceSearch(allRaces: Race[]): UseRaceSearchReturn {
    // 年の選択肢は初回マウント時だけ生成（currentYear を useMemo 内に閉じ込めて依存配列を空に）
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

    // 月の選択肢
    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            return { label: `${m}月`, value: m.toString() };
        });
    }, []);

    // フィルタリングロジック
    const filteredRaces = useMemo(() => {
        if (!selectedYear) return [];

        return allRaces
            .filter((race) => {
                // IDが10桁（スクレイピング済み詳細データ）のみ対象
                if (!/^\d{10}$/.test(race.id)) return false;

                const d = new Date(race.date);
                const y = d.getFullYear().toString();
                const m = (d.getMonth() + 1).toString();

                if (y !== selectedYear) return false;
                if (selectedMonth && m !== selectedMonth) return false;

                return true;
            })
            .sort((a, b) => a.date.localeCompare(b.date)); // 日付順
    }, [allRaces, selectedYear, selectedMonth]);

    return {
        selectedYear,
        selectedMonth,
        setSelectedYear,
        setSelectedMonth,
        filteredRaces,
        years,
        months,
    };
}
