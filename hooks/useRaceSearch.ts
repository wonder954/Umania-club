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
    // デフォルト年を現在の年に設定
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    // 年の選択肢生成 (データから自動生成も可だが、今回は固定で良しとするか、データ依存にする)
    // 簡易的に前後数年を含める
    const years = useMemo(() => {
        const y = parseInt(currentYear);
        return [
            { label: `${y - 1}年`, value: (y - 1).toString() },
            { label: `${y}年`, value: y.toString() },
            { label: `${y + 1}年`, value: (y + 1).toString() },
        ];
    }, [currentYear]);

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

        return allRaces.filter(race => {
            // IDが10桁（スクレイピング済み詳細データ）のみ対象
            if (!/^\d{10}$/.test(race.id)) return false;

            const d = new Date(race.date);
            const y = d.getFullYear().toString();
            // getMonth() is 0-indexed
            const m = (d.getMonth() + 1).toString();

            if (y !== selectedYear) return false;
            // 月が選択されている場合のみフィルタ、未選択ならその年すべて表示？
            // 要件では「月を選択」→「レースを選択」なので、月選択は必須フローにする
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
