type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export function Modal({ open, onClose, children }: ModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-lg w-full shadow-xl">
                <button
                    className="text-gray-500 hover:text-gray-800 float-right"
                    onClick={onClose}
                >
                    ×
                </button>
                <div className="mt-4 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}