"use client";
import { Horse } from "@/types/horse";
import { NagashiSelectorValue } from "@/types/bet";
import NagashiBaseSelector from "./NagashiBaseSelector";

type Props = {
    horses: Horse[];
    allowedNumbers: number[];
    onChange: (v: NagashiSelectorValue) => void;
};

export default function UmarenSelector({
    horses,
    allowedNumbers,
    onChange,
}: Props) {
    const handleChange = ({ axis, opponents }: { axis: number[]; opponents: number[] }) => {
        // 馬連流し: 軸は1頭 (axis[0])
        onChange({
            axis: axis[0] ?? null,
            opponents,
        });
    };

    return (
        <NagashiBaseSelector
            horses={horses}
            allowedNumbers={allowedNumbers}
            onChange={handleChange}
            axisLimit={1}
        />
    );
}