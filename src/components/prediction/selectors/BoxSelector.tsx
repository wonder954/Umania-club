"use client";
import React from "react";
import BoxBaseSelector from "./BoxBaseSelector";

type Props = {
    horses: { number?: number | string; name: string }[];
    selected: number[];
    onChange: (nums: number[]) => void;
    allowedNumbers?: number[];
    maxCount?: number;
};

export default function BoxSelector(props: Props) {
    return <BoxBaseSelector {...props} />;
}