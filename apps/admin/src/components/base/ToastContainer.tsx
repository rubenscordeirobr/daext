import Toast from './Toast';
import type { Toast as ToastType } from '../../hooks/useToast';

interface ToastContainerProps {
    toasts: ToastType[];
    onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}
