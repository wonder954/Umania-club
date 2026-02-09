"use client";
import React from "react";
import { Horse } from "@/types/horse";
import FormationBaseSelector from "./FormationBaseSelector";

type Formation = {
    first: number[];
    second: number[];
    third: number[];
};

type BetType = "単勝" | "複勝" | "馬連" | "馬単" | "ワイド" | "3連複" | "3連単";

type Props = {
    horses: Horse[];
    formation: Formation;
    onChange: (f: Formation) => void;
    allowedNumbers?: number[];
    selectedType: BetType;
    isSingleMode?: boolean;
};

export default function FormationSelector(props: Props) {
    return <FormationBaseSelector {...props} />;
}