"use client";
import { Horse } from "@/types/horse";
import { NagashiSelectorValue } from "@/types/bet";
import NagashiBaseSelector from "./NagashiBaseSelector";

type Props = {
    horses: Horse[];
    allowedNumbers: number[];
    onChange: (v: NagashiSelectorValue) => void;
};

export default function SanrenpukuSelector({
    horses,
    allowedNumbers,
    onChange,
}: Props) {
    // NagashiBaseSelector は axis: number[] を返す
    // SanrenpukuSelector の onChange は { axis: number[], opponents: number[] } を期待するが、
    // NagashiSelectorValue の定義によっては axis が number | number[] の可能性がある。
    // types/bet を確認すると NagashiSelectorValue は { axis: number | number[] | null, opponents: number[] } と想定される。
    // 既存の実装では axis: number[] だったのでそのまま渡す。

    return (
        <NagashiBaseSelector
            horses={horses}
            allowedNumbers={allowedNumbers}
            onChange={onChange} // そのまま渡せる
            axisLimit={2}
        />
    );
}