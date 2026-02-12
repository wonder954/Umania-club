"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export function Modal({ open, onClose, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!open || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
                className="
                    bg-white/70 backdrop-blur-sm 
                    rounded-2xl shadow-sm w-full max-w-lg p-6 
                    border border-white/40 relative
                    max-h-[90vh] overflow-y-auto
                "
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-600 hover:text-slate-800 text-xl font-bold"
                >
                    ×
                </button>

                {children}
            </div>
        </div>,
        document.body
    );
}