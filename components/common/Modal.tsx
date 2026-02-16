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

    useEffect(() => {
        setMounted(true);
    }, []);

    // スクロールロック
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!mounted || !open) return null;

    const colors = ["#ffffff", "#aee4ff", "#ffd6f5", "#fff7c2"];

    return createPortal(
        <div
            className={`
                fixed inset-0 z-[9999]
                flex items-center justify-center p-4
                transition-opacity duration-300
                ${open ? "opacity-100" : "opacity-0"}
            `}
            onClick={onClose}
        >
            {/* 粒子 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(40)].map((_, i) => {
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    return (
                        <div
                            key={i}
                            className="absolute rounded-full blur-[6px]"
                            style={{
                                backgroundColor: color,
                                width: `${16 + Math.random() * 20}px`,
                                height: `${16 + Math.random() * 20}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                opacity: 0.85 + Math.random() * 0.15,
                                animation: `floatParticle ${3 + Math.random() * 4
                                    }s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    );
                })}
            </div>

            {/* 背景 */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            {/* モーダル本体 */}
            <div
                className={`
                    relative z-[2]
                    bg-white/90 backdrop-blur-sm
                    rounded-2xl shadow-2xl w-full max-w-lg p-6
                    border border-white/50
                    transform transition-all duration-300
                    scale-100 opacity-100
                    max-h-[90vh] overflow-y-auto
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-600 hover:text-slate-800 text-xl font-bold"
                >
                    ×
                </button>

                {children}
            </div>

            <style jsx>{`
                @keyframes floatParticle {
                    0% {
                        transform: translateY(0px) translateX(0px) scale(1);
                    }
                    30% {
                        transform: translateY(-20px) translateX(12px) scale(1.2);
                    }
                    60% {
                        transform: translateY(-35px) translateX(-8px) scale(0.9);
                    }
                    100% {
                        transform: translateY(0px) translateX(0px) scale(1);
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}