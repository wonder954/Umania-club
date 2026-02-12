type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export function Modal({ open, onClose, children }: ModalProps) {
    if (!open) return null;

    return (
        <div
            className="
                fixed inset-0 
                bg-black/30 backdrop-blur-sm 
                flex items-center justify-center 
                z-50
            "
        >
            <div
                className="
                    bg-white/70 backdrop-blur-sm 
                    rounded-2xl p-6 
                    max-w-lg w-full 
                    shadow-sm border border-white/40
                    relative
                "
            >
                {/* 閉じるボタン */}
                <button
                    className="
                        absolute top-3 right-3 
                        text-slate-600 hover:text-slate-800 
                        text-xl font-bold
                    "
                    onClick={onClose}
                >
                    ×
                </button>

                <div className="mt-2 space-y-4 text-slate-800">
                    {children}
                </div>
            </div>
        </div>
    );
}