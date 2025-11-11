import { useEffect } from 'react';
import type { Toast as ToastType } from '../../hooks/useToast';

interface ToastProps {
    toast: ToastType;
    onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
            default:
                return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return 'ri-check-circle-line';
            case 'error':
                return 'ri-error-warning-line';
            case 'warning':
                return 'ri-alert-line';
            case 'info':
                return 'ri-information-line';
            default:
                return 'ri-notification-line';
        }
    };

    return (
        <div
            className={`flex items-center p-4 mb-3 border rounded-lg shadow-lg ${getToastStyles()} animate-slide-in-right`}
        >
            <div className="flex items-center">
                <i className={`${getIcon()} text-lg mr-3`}></i>
                <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="ml-auto text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
                <i className="ri-close-line"></i>
            </button>
        </div>
    );
}
