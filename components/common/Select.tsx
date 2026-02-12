import React from "react";

type Option = {
    label: string;
    value: string | number;
};

type Props = {
    label?: string;
    value: string | number;
    options: Option[];
    onChange: (value: string | number) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export function Select({
    label,
    value,
    options,
    onChange,
    placeholder = "選択してください",
    disabled = false,
    className = "",
}: Props) {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label className="mb-1 text-sm font-semibold text-slate-700">
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="
                        appearance-none w-full 
                        bg-white/70 backdrop-blur-sm 
                        border border-white/40 
                        text-slate-800 text-sm 
                        rounded-xl 
                        focus:ring-blue-300 focus:border-blue-300 
                        block p-2.5 
                        disabled:bg-white/40 disabled:text-slate-400
                        shadow-sm
                    "
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>

                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* ▼ アイコン（透明感を持たせる） */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600/80">
                    <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}